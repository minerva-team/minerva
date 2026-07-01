import pytest
from datetime import timedelta
from django.db import IntegrityError
from django.utils import timezone

from accounts.models import User, OTPVerification


@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(
        email="test@example.com",
        password="StrongPass123",
        role="Employee",
    )

    assert user.email == "test@example.com"
    assert user.role == "Employee"
    assert user.check_password("StrongPass123")
    assert str(user) == "test@example.com"


@pytest.mark.django_db
def test_create_superuser():
    admin = User.objects.create_superuser(
        email="admin@example.com",
        password="Admin123",
        role="Admin",
    )

    assert admin.is_staff is True
    assert admin.is_superuser is True
    assert admin.role == "Admin"


@pytest.mark.django_db
def test_email_must_be_unique():
    User.objects.create_user(
        email="test@example.com",
        password="123456",
        role="Employee",
    )

    with pytest.raises(IntegrityError):
        User.objects.create_user(
            email="test@example.com",
            password="654321",
            role="Employee",
        )


@pytest.mark.django_db
def test_phone_number_must_be_unique():
    User.objects.create_user(
        email="user1@example.com",
        password="123456",
        role="Employee",
        phone_number="09111111111",
    )

    with pytest.raises(IntegrityError):
        User.objects.create_user(
            email="user2@example.com",
            password="123456",
            role="Employee",
            phone_number="09111111111",
        )


@pytest.mark.django_db
def test_user_timestamps():
    user = User.objects.create_user(
        email="time@example.com",
        password="123456",
        role="Employee",
    )

    assert user.created_at is not None
    assert user.updated_at is not None