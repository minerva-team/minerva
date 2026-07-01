import pytest
from datetime import timedelta
from django.utils import timezone

from accounts.models import User, OTPVerification


@pytest.fixture
def user():
    return User.objects.create_user(
        email="user@example.com",
        password="123456",
        role="Employee",
    )


@pytest.mark.django_db
def test_create_otp(user):
    otp = OTPVerification.objects.create(
        user=user,
        code="123456",
        purpose="login",
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    assert otp.user == user
    assert otp.code == "123456"
    assert otp.purpose == "login"
    assert otp.is_used is False


@pytest.mark.django_db
def test_otp_str(user):
    otp = OTPVerification.objects.create(
        user=user,
        code="111111",
        purpose="reset_password",
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    assert str(otp) == "user@example.com - reset_password"


@pytest.mark.django_db
def test_otp_ordering(user):
    otp1 = OTPVerification.objects.create(
        user=user,
        code="111111",
        purpose="login",
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    otp2 = OTPVerification.objects.create(
        user=user,
        code="222222",
        purpose="login",
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    assert OTPVerification.objects.first() == otp2


@pytest.mark.django_db
def test_default_is_used(user):
    otp = OTPVerification.objects.create(
        user=user,
        code="999999",
        purpose="login",
        expires_at=timezone.now() + timedelta(minutes=5),
    )

    assert otp.is_used is False