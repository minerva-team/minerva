import pytest
from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, OTPVerification


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_with_phone():
    return User.objects.create_user(
        email="user@example.com",
        password="123456",
        role="Employee",
        phone_number="09111111111",
    )


@pytest.fixture
def user_without_phone():
    return User.objects.create_user(
        email="nophone@example.com",
        password="123456",
        role="Employee",
    )


# ---------------- RequestOTPView ----------------

@pytest.mark.django_db
class TestRequestOTPView:
    url = reverse("request-otp")

    def test_request_otp_success(self, api_client, user_with_phone):
        response = api_client.post(self.url, {"email": user_with_phone.email})
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        assert OTPVerification.objects.filter(
            user=user_with_phone, purpose="login", is_used=False
        ).exists()

    def test_request_otp_user_not_found(self, api_client):
        response = api_client.post(self.url, {"email": "notfound@example.com"})
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "error" in response.data

    def test_request_otp_no_phone_number(self, api_client, user_without_phone):
        response = api_client.post(self.url, {"email": user_without_phone.email})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    def test_request_otp_invalid_email_format(self, api_client):
        response = api_client.post(self.url, {"email": "not-an-email"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_request_otp_missing_email(self, api_client):
        response = api_client.post(self.url, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------- VerifyOTPView ----------------

@pytest.mark.django_db
class TestVerifyOTPView:
    url = reverse("verify-otp")

    def _create_otp(self, user, code="123456", used=False, expired=False):
        return OTPVerification.objects.create(
            user=user,
            code=code,
            purpose="login",
            is_used=used,
            expires_at=timezone.now() + timedelta(minutes=-1 if expired else 2),
        )

    def test_verify_otp_success(self, api_client, user_with_phone):
        otp = self._create_otp(user_with_phone)

        response = api_client.post(self.url, {
            "email": user_with_phone.email,
            "code": otp.code,
        })

        assert response.status_code == status.HTTP_200_OK
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]
        assert response.data["user"]["email"] == user_with_phone.email

        otp.refresh_from_db()
        assert otp.is_used is True

    def test_verify_otp_user_not_found(self, api_client):
        response = api_client.post(self.url, {
            "email": "notfound@example.com",
            "code": "123456",
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_verify_otp_wrong_code(self, api_client, user_with_phone):
        self._create_otp(user_with_phone, code="123456")

        response = api_client.post(self.url, {
            "email": user_with_phone.email,
            "code": "654321",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_expired(self, api_client, user_with_phone):
        otp = self._create_otp(user_with_phone, expired=True)

        response = api_client.post(self.url, {
            "email": user_with_phone.email,
            "code": otp.code,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_already_used(self, api_client, user_with_phone):
        otp = self._create_otp(user_with_phone, used=True)

        response = api_client.post(self.url, {
            "email": user_with_phone.email,
            "code": otp.code,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_invalid_code_format(self, api_client, user_with_phone):
        response = api_client.post(self.url, {
            "email": user_with_phone.email,
            "code": "12A",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST