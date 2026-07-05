import pytest
from datetime import date
from decimal import Decimal
from django.db import IntegrityError

from accounts.models import User
from hr.models import (
    Department,
    Employee,
    Contract,
    Attendance,
    LeaveType,
    LeaveRequest,
)



@pytest.mark.django_db
def test_department_str():
    department = Department.objects.create(name="IT")
    assert str(department) == "IT"




@pytest.mark.django_db
def test_employee_str():
    user = User.objects.create(email="test@example.com")
    department = Department.objects.create(name="HR")

    employee = Employee.objects.create(
        user=user,
        department=department,
        employee_code="EMP001",
        national_id="1234567890",
        hire_date=date.today()
    )

    assert str(employee) == "test@example.com (EMP001)"


@pytest.mark.django_db
def test_active_employee_manager():
    user1 = User.objects.create(email="active@example.com")
    user2 = User.objects.create(email="deleted@example.com")

    department = Department.objects.create(name="HR")

    Employee.objects.create(
        user=user1,
        department=department,
        employee_code="EMP001",
        national_id="1234567890",
        hire_date=date.today(),
        is_deleted=False
    )

    Employee.objects.create(
        user=user2,
        department=department,
        employee_code="EMP002",
        national_id="1234567891",
        hire_date=date.today(),
        is_deleted=True
    )

    assert Employee.active_employees.count() == 1




@pytest.mark.django_db
def test_contract_str():
    user = User.objects.create(email="employee@example.com")
    department = Department.objects.create(name="IT")

    employee = Employee.objects.create(
        user=user,
        department=department,
        employee_code="EMP001",
        national_id="1234567890",
        hire_date=date.today()
    )

    contract = Contract.objects.create(
        employee=employee,
        contract_type="Full-time",
        base_salary=Decimal("5000.00"),
        start_date=date.today()
    )

    assert str(contract) == "EMP001 - Full-time"


@pytest.mark.django_db
def test_only_one_active_contract():
    user = User.objects.create(email="employee2@example.com")
    department = Department.objects.create(name="IT")

    employee = Employee.objects.create(
        user=user,
        department=department,
        employee_code="EMP002",
        national_id="1234567891",
        hire_date=date.today()
    )

    Contract.objects.create(
        employee=employee,
        contract_type="Full-time",
        base_salary=5000,
        start_date=date.today(),
        is_active=True
    )

    with pytest.raises(IntegrityError):
        Contract.objects.create(
            employee=employee,
            contract_type="Part-time",
            base_salary=3000,
            start_date=date.today(),
            is_active=True
        )




@pytest.mark.django_db
def test_unique_daily_attendance():
    user = User.objects.create(email="attendance@example.com")
    department = Department.objects.create(name="Finance")

    employee = Employee.objects.create(
        user=user,
        department=department,
        employee_code="EMP001",
        national_id="1234567890",
        hire_date=date.today()
    )

    Attendance.objects.create(
        employee=employee,
        date=date.today(),
        status="Present"
    )

    with pytest.raises(IntegrityError):
        Attendance.objects.create(
            employee=employee,
            date=date.today(),
            status="Absent"
        )




@pytest.mark.django_db
def test_leave_type_str():
    leave = LeaveType.objects.create(name="Sick Leave")
    assert str(leave) == "Sick Leave"




@pytest.mark.django_db
def test_leave_request_str():
    user = User.objects.create(email="leave@example.com")
    department = Department.objects.create(name="IT")

    employee = Employee.objects.create(
        user=user,
        department=department,
        employee_code="EMP001",
        national_id="1234567890",
        hire_date=date.today()
    )

    leave_type = LeaveType.objects.create(name="Vacation")

    leave = LeaveRequest.objects.create(
        employee=employee,
        leave_type=leave_type,
        start_date=date.today(),
        end_date=date.today()
    )

    assert str(leave) == "EMP001 - Vacation - Pending"