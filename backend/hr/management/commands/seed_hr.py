from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from datetime import timedelta, date, datetime
import random

from accounts.models import User
from hr.models import (
    Department,
    Employee,
    Contract,
    Attendance,
    LeaveType,
    LeaveRequest
)

fake = Faker()


class Command(BaseCommand):
    help = "Seed HR app safely (idempotent)"

    def add_arguments(self, parser):
        parser.add_argument('--employees', type=int, default=10)

    def handle(self, *args, **kwargs):
        emp_count = kwargs['employees']

        with transaction.atomic():
            # -------------------------
            # 1. Departments (idempotent)
            # -------------------------
            department_names = ["IT", "HR", "Finance", "Marketing", "Sales"]
            departments = []

            for name in department_names:
                dept, _ = Department.objects.get_or_create(
                    name=name,
                    defaults={"description": fake.text(max_nb_chars=100)}
                )
                departments.append(dept)

            self.stdout.write(self.style.SUCCESS("Departments ready"))

            # -------------------------
            # 2. Employees (OneToOne safe, is_deleted aware)
            # -------------------------
            existing_emp_user_ids = set(
                Employee.objects.values_list('user_id', flat=True)
            )
            users = list(User.objects.exclude(id__in=existing_emp_user_ids))
            random.shuffle(users)

            used_national_ids = set(
                Employee.objects.values_list('national_id', flat=True)
            )
            used_employee_codes = set(
                Employee.objects.values_list('employee_code', flat=True)
            )

            new_employees = []

            for user in users:
                if len(new_employees) >= emp_count:
                    break

                national_id = str(random.randint(1000000000, 9999999999))
                while national_id in used_national_ids:
                    national_id = str(random.randint(1000000000, 9999999999))
                used_national_ids.add(national_id)

                employee_code = f"EMP{random.randint(1000, 9999)}"
                while employee_code in used_employee_codes:
                    employee_code = f"EMP{random.randint(1000, 9999)}"
                used_employee_codes.add(employee_code)

                emp = Employee.objects.create(
                    user=user,
                    department=random.choice(departments),
                    employee_code=employee_code,
                    national_id=national_id,
                    phone=fake.msisdn()[:15],
                    hire_date=fake.date_between(start_date='-3y', end_date='today'),
                    is_deleted=False,
                )

                new_employees.append(emp)

            self.stdout.write(self.style.SUCCESS(f"{len(new_employees)} employees created"))

            # فقط کارمندهای فعال (حذف نرم نشده) رو برای بقیه‌ی مراحل استفاده می‌کنیم
            employees = list(Employee.objects.filter(is_deleted=False))

            # -------------------------
            # 3. Contracts (1 active per employee — constraint-safe)
            # -------------------------
            contract_count = 0
            employees_with_active_contract = set(
                Contract.objects.filter(is_active=True).values_list('employee_id', flat=True)
            )

            for emp in employees:
                if emp.id in employees_with_active_contract:
                    continue

                base = random.randint(30000, 120000)

                Contract.objects.create(
                    employee=emp,
                    contract_type=random.choice(["Full-time", "Part-time", "Hourly"]),
                    base_salary=base,
                    housing_allowance=random.randint(1000, 5000),
                    transport_allowance=random.randint(500, 3000),
                    start_date=emp.hire_date,
                    is_active=True
                )

                contract_count += 1

            self.stdout.write(self.style.SUCCESS(f"{contract_count} contracts created"))

            # -------------------------
            # 4. Attendance (unique_daily_attendance constraint-safe)
            # -------------------------
            attendance_count = 0

            for emp in employees:
                existing_days = set(
                    Attendance.objects.filter(employee=emp).values_list('date', flat=True)
                )

                for i in range(10):
                    day = date.today() - timedelta(days=i)

                    if day in existing_days:
                        continue

                    status = random.choices(
                        ["Present", "Absent", "On Leave"],
                        weights=[0.8, 0.1, 0.1]
                    )[0]

                    clock_in_time = None
                    clock_out_time = None

                    if status == "Present":
                        start_hour = random.randint(7, 9)
                        start_minute = random.randint(0, 59)
                        clock_in_dt = datetime.combine(
                            day, datetime.min.time()
                        ).replace(hour=start_hour, minute=start_minute)
                        clock_out_dt = clock_in_dt + timedelta(
                            hours=8, minutes=random.randint(0, 30)
                        )
                        clock_in_time = clock_in_dt.time()
                        clock_out_time = clock_out_dt.time()

                    Attendance.objects.create(
                        employee=emp,
                        date=day,
                        clock_in=clock_in_time,
                        clock_out=clock_out_time,
                        status=status
                    )

                    attendance_count += 1

            self.stdout.write(self.style.SUCCESS(f"{attendance_count} attendance records created"))

            # -------------------------
            # 5. Leave Types (idempotent)
            # -------------------------
            leave_types = []
            for name in ["Annual Leave", "Sick Leave", "Unpaid Leave"]:
                lt, _ = LeaveType.objects.get_or_create(
                    name=name,
                    defaults={"is_paid": name != "Unpaid Leave"}
                )
                leave_types.append(lt)

            self.stdout.write(self.style.SUCCESS("Leave types ready"))

            # -------------------------
            # 6. Leave Requests (check_leave_end_date_after_start_date safe)
            # -------------------------
            leave_count = 0

            for emp in employees:
                possible_approvers = [e for e in employees if e.id != emp.id]

                for _ in range(2):
                    start = fake.date_between(start_date='-30d', end_date='today')
                    end = start + timedelta(days=random.randint(1, 5))  # تضمین end >= start

                    if LeaveRequest.objects.filter(employee=emp, start_date=start).exists():
                        continue

                    status = random.choice(["Pending", "Approved", "Rejected"])

                    approved_by = None
                    if status in ["Approved", "Rejected"] and possible_approvers:
                        approved_by = random.choice(possible_approvers)

                    LeaveRequest.objects.create(
                        employee=emp,
                        leave_type=random.choice(leave_types),
                        start_date=start,
                        end_date=end,
                        status=status,
                        reason=fake.sentence(),
                        approved_by=approved_by
                    )

                    leave_count += 1

            self.stdout.write(self.style.SUCCESS(f"{leave_count} leave requests created"))

        self.stdout.write(self.style.SUCCESS("HR seeding completed successfully"))