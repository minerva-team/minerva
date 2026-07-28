from datetime import date, datetime, timedelta
import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from accounts.models import User
from hr.models import (
    Attendance,
    Contract,
    ContractType,
    Department,
    Employee,
    EmployeeDocument,
    LeaveRequest,
    LeaveType,
)

fake = Faker()


class Command(BaseCommand):
    help = "Seed HR app safely (idempotent, constraint-safe, bulk optimized)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--employees',
            type=int,
            default=10,
            help='Number of employees to create',
        )

    def handle(self, *args, **kwargs):
        emp_count = kwargs['employees']

        with transaction.atomic():
            # 1. Departments
            department_names = ["IT", "HR", "Finance", "Marketing", "Sales"]
            departments = [
                Department.objects.get_or_create(
                    name=name,
                    defaults={"description": fake.text(max_nb_chars=100)},
                )[0]
                for name in department_names
            ]
            self.stdout.write(self.style.SUCCESS("✓ Departments ready"))

            # 2. Contract Types
            contract_type_names = ["Full-time", "Part-time", "Hourly"]
            contract_types = [
                ContractType.objects.get_or_create(
                    name=name, defaults={"description": fake.sentence()}
                )[0]
                for name in contract_type_names
            ]
            self.stdout.write(self.style.SUCCESS("✓ Contract types ready"))

            # 3. Employees
            existing_emp_user_ids = set(
                Employee.objects.values_list('user_id', flat=True)
            )
            available_users = list(
                User.objects.exclude(id__in=existing_emp_user_ids)
            )
            random.shuffle(available_users)

            if len(available_users) < emp_count:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ Only {len(available_users)} users available. "
                        f"Seeding with available {len(available_users)} users."
                    )
                )
                emp_count = len(available_users)

            if emp_count == 0:
                self.stdout.write(
                    self.style.ERROR(
                        "❌ No users available. Run accounts seed first."
                    )
                )
                return

            used_national_ids = set(
                Employee.objects.values_list('national_id', flat=True)
            )
            used_employee_codes = set(
                Employee.objects.values_list('employee_code', flat=True)
            )

            selected_users = available_users[:emp_count]
            employees_to_create = []

            for user in selected_users:
                national_id = self._generate_unique_value(
                    used_national_ids,
                    lambda: str(random.randint(1000000000, 9999999999)).zfill(
                        10
                    ),
                )
                employee_code = self._generate_unique_value(
                    used_employee_codes,
                    lambda: f"EMP{random.randint(10000, 99999)}",
                )

                gender = random.choice(["M", "F", "O"])
                first_name = self._get_first_name(gender)

                employees_to_create.append(
                    Employee(
                        user=user,
                        department=random.choice(departments),
                        job_title=fake.job(),
                        employee_code=employee_code,
                        national_id=national_id,
                        phone=fake.msisdn()[:15],
                        hire_date=fake.date_between(
                            start_date='-3y', end_date='today'
                        ),
                        is_deleted=False,
                        date_of_birth=fake.date_of_birth(
                            minimum_age=18, maximum_age=65
                        ),
                        address=fake.address(),
                        gender=gender,
                        emergency_contact_name=f"{first_name} {fake.last_name()}",
                        emergency_contact_phone=fake.msisdn()[:20],
                        emergency_contact_relationship=random.choice(
                            ["Parent", "Spouse", "Sibling", "Friend"]
                        ),
                    )
                )

            Employee.objects.bulk_create(employees_to_create)

            # Re-fetch active employees to guarantee populated primary keys across all DB engines
            all_active_employees = list(
                Employee.active_employees.filter(user__in=selected_users)
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(all_active_employees)} employees created"
                )
            )

            # 4. Manager Hierarchy
            employees_without_manager = [
                e for e in all_active_employees if e.reports_to_id is None
            ]
            random.shuffle(employees_without_manager)

            top_level_count = max(1, len(employees_without_manager) // 5)
            managers_pool = employees_without_manager[:top_level_count]

            employees_to_update = []
            if managers_pool:
                for emp in employees_without_manager[top_level_count:]:
                    valid_managers = [
                        m for m in managers_pool if m.id != emp.id
                    ]
                    if valid_managers:
                        emp.reports_to = random.choice(valid_managers)
                        employees_to_update.append(emp)

            if employees_to_update:
                Employee.objects.bulk_update(
                    employees_to_update, ['reports_to']
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(employees_to_update)} employees assigned managers"
                )
            )

            # 5. Contracts
            employees_with_active_contract = set(
                Contract.objects.filter(is_active=True).values_list(
                    'employee_id', flat=True
                )
            )

            contracts_to_create = [
                Contract(
                    employee=emp,
                    contract_type=random.choice(contract_types),
                    base_salary=random.randint(30000, 120000),
                    housing_allowance=random.randint(1000, 5000),
                    transport_allowance=random.randint(500, 3000),
                    start_date=emp.hire_date,
                    is_active=True,
                )
                for emp in all_active_employees
                if emp.id not in employees_with_active_contract
            ]

            Contract.objects.bulk_create(contracts_to_create)
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(contracts_to_create)} contracts created"
                )
            )

            # 6. Attendance
            window_start = date.today() - timedelta(days=9)
            existing_attendance = set(
                Attendance.objects.filter(
                    employee__in=all_active_employees, date__gte=window_start
                ).values_list('employee_id', 'date')
            )

            attendance_to_create = []

            for emp in all_active_employees:
                for i in range(10):
                    day = date.today() - timedelta(days=i)

                    if (emp.id, day) in existing_attendance:
                        continue

                    status = random.choices(
                        ["Present", "Absent", "On Leave"],
                        weights=[0.8, 0.1, 0.1],
                    )[0]

                    clock_in_time, clock_out_time = None, None
                    if status == "Present":
                        clock_in_time, clock_out_time = (
                            self._generate_work_times(day)
                        )

                    attendance_to_create.append(
                        Attendance(
                            employee=emp,
                            date=day,
                            clock_in=clock_in_time,
                            clock_out=clock_out_time,
                            status=status,
                        )
                    )

            Attendance.objects.bulk_create(
                attendance_to_create, batch_size=500
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(attendance_to_create)} attendance records created"
                )
            )

            # 7. Leave Types
            leave_type_configs = [
                ("Annual Leave", True),
                ("Sick Leave", True),
                ("Unpaid Leave", False),
            ]
            leave_types = [
                LeaveType.objects.get_or_create(
                    name=name, defaults={"is_paid": is_paid}
                )[0]
                for name, is_paid in leave_type_configs
            ]
            self.stdout.write(self.style.SUCCESS("✓ Leave types ready"))

            # 8. Leave Requests
            existing_leave = set(
                LeaveRequest.objects.filter(
                    employee__in=all_active_employees
                ).values_list('employee_id', 'start_date')
            )

            leave_requests_to_create = []

            for emp in all_active_employees:
                possible_approvers = [
                    e for e in all_active_employees if e.id != emp.id
                ]

                for _ in range(2):
                    start = fake.date_between(
                        start_date='-30d', end_date='today'
                    )
                    end = start + timedelta(days=random.randint(1, 5))

                    if (emp.id, start) in existing_leave:
                        continue
                    existing_leave.add((emp.id, start))

                    status = random.choice(["Pending", "Approved", "Rejected"])
                    approved_by = (
                        random.choice(possible_approvers)
                        if status in ["Approved", "Rejected"]
                        and possible_approvers
                        else None
                    )

                    leave_requests_to_create.append(
                        LeaveRequest(
                            employee=emp,
                            leave_type=random.choice(leave_types),
                            start_date=start,
                            end_date=end,
                            status=status,
                            reason=fake.sentence(),
                            approved_by=approved_by,
                        )
                    )

            LeaveRequest.objects.bulk_create(
                leave_requests_to_create, batch_size=500
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(leave_requests_to_create)} leave requests created"
                )
            )

            # 9. Employee Documents
            document_type_names = [
                "contract",
                "resume",
                "identity",
                "certificate",
                "other",
            ]
            existing_docs = set(
                EmployeeDocument.objects.filter(
                    employee__in=all_active_employees
                ).values_list('employee_id', 'document_type')
            )

            documents_to_create = []

            for emp in all_active_employees:
                doc_types = random.sample(
                    document_type_names, k=random.randint(1, 3)
                )

                for doc_type in doc_types:
                    if (emp.id, doc_type) in existing_docs:
                        continue
                    existing_docs.add((emp.id, doc_type))

                    doc = EmployeeDocument(
                        employee=emp,
                        document_type=doc_type,
                        title=f"{doc_type.title()} - {emp.employee_code}",
                    )
                    doc.file.name = f"employees/documents/{emp.employee_code}_{doc_type}.txt"
                    documents_to_create.append(doc)

            EmployeeDocument.objects.bulk_create(
                documents_to_create, batch_size=500
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ {len(documents_to_create)} employee documents created"
                )
            )

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 50))
        self.stdout.write(
            self.style.SUCCESS("✅ HR seeding completed successfully!")
        )
        self.stdout.write(self.style.SUCCESS("=" * 50))

    def _generate_unique_value(
        self, used_set, generator_func, max_attempts=100
    ):
        for _ in range(max_attempts):
            value = generator_func()
            if value not in used_set:
                used_set.add(value)
                return value

        raise RuntimeError(
            f"Failed to generate unique value after {max_attempts} attempts."
        )

    def _get_first_name(self, gender):
        if gender == "M":
            return fake.first_name_male()
        elif gender == "F":
            return fake.first_name_female()
        return fake.first_name()

    def _generate_work_times(self, day):
        start_hour = random.randint(7, 9)
        start_minute = random.randint(0, 59)

        naive_start = datetime.combine(day, datetime.min.time()).replace(
            hour=start_hour, minute=start_minute
        )
        clock_in_dt = (
            timezone.make_aware(naive_start)
            if timezone.is_naive(naive_start)
            else naive_start
        )
        clock_out_dt = clock_in_dt + timedelta(
            hours=8, minutes=random.randint(0, 30)
        )

        return clock_in_dt.time(), clock_out_dt.time()