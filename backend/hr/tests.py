from datetime import date
from decimal import Decimal

from django.test import TestCase
from django.db import IntegrityError

from accounts.models import User
from .models import (
    Department,
    Employee,
    Contract,
    Attendance,
    LeaveType,
    LeaveRequest,
)


class DepartmentModelTest(TestCase):
    def test_department_str(self):
        department = Department.objects.create(
            name="IT"
        )

        self.assertEqual(str(department), "IT")


class EmployeeModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            email="test@example.com"
        )

        self.department = Department.objects.create(
            name="HR"
        )

    def test_employee_str(self):
        employee = Employee.objects.create(
            user=self.user,
            department=self.department,
            employee_code="EMP001",
            national_id="1234567890",
            hire_date=date.today()
        )

        self.assertEqual(
            str(employee),
            "test@example.com (EMP001)"
        )

    def test_active_employee_manager(self):
        Employee.objects.create(
            user=self.user,
            department=self.department,
            employee_code="EMP001",
            national_id="1234567890",
            hire_date=date.today(),
            is_deleted=False
        )

        user2 = User.objects.create(
            email="deleted@example.com"
        )

        Employee.objects.create(
            user=user2,
            department=self.department,
            employee_code="EMP002",
            national_id="1234567891",
            hire_date=date.today(),
            is_deleted=True
        )

        self.assertEqual(
            Employee.active_employees.count(),
            1
        )


class ContractModelTest(TestCase):

    def setUp(self):
        user = User.objects.create(
            email="employee@example.com"
        )

        department = Department.objects.create(
            name="IT"
        )

        self.employee = Employee.objects.create(
            user=user,
            department=department,
            employee_code="EMP001",
            national_id="1234567890",
            hire_date=date.today()
        )

    def test_contract_str(self):
        contract = Contract.objects.create(
            employee=self.employee,
            contract_type="Full-time",
            base_salary=Decimal("5000.00"),
            start_date=date.today()
        )

        self.assertEqual(
            str(contract),
            "EMP001 - Full-time"
        )

    def test_only_one_active_contract(self):
        Contract.objects.create(
            employee=self.employee,
            contract_type="Full-time",
            base_salary=5000,
            start_date=date.today(),
            is_active=True
        )

        with self.assertRaises(IntegrityError):
            Contract.objects.create(
                employee=self.employee,
                contract_type="Part-time",
                base_salary=3000,
                start_date=date.today(),
                is_active=True
            )


class AttendanceModelTest(TestCase):

    def setUp(self):
        user = User.objects.create(
            email="attendance@example.com"
        )

        department = Department.objects.create(
            name="Finance"
        )

        self.employee = Employee.objects.create(
            user=user,
            department=department,
            employee_code="EMP001",
            national_id="1234567890",
            hire_date=date.today()
        )

    def test_unique_daily_attendance(self):
        Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            status="Present"
        )

        with self.assertRaises(IntegrityError):
            Attendance.objects.create(
                employee=self.employee,
                date=date.today(),
                status="Absent"
            )


class LeaveTypeModelTest(TestCase):

    def test_leave_type_str(self):
        leave = LeaveType.objects.create(
            name="Sick Leave"
        )

        self.assertEqual(
            str(leave),
            "Sick Leave"
        )


class LeaveRequestModelTest(TestCase):

    def setUp(self):
        user = User.objects.create(
            email="leave@example.com"
        )

        department = Department.objects.create(
            name="IT"
        )

        self.employee = Employee.objects.create(
            user=user,
            department=department,
            employee_code="EMP001",
            national_id="1234567890",
            hire_date=date.today()
        )

        self.leave_type = LeaveType.objects.create(
            name="Vacation"
        )

    def test_leave_request_str(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=date.today(),
            end_date=date.today()
        )

        self.assertEqual(
            str(leave),
            "EMP001 - Vacation - Pending"
        )