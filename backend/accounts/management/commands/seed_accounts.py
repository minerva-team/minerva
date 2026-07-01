from django.core.management.base import BaseCommand
from faker import Faker
from accounts.models import User, OTPVerification
from django.utils import timezone
from datetime import timedelta
import random

fake = Faker()

class Command(BaseCommand):
    help = "Seed users and OTP data"

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **kwargs):
        count = kwargs['count']

        roles = ['Admin', 'HR Manager', 'Finance Manager', 'Employee']

        users = []

        for _ in range(count):
            email = fake.unique.email()

            user = User.objects.create_user(
                email=email,
                password="password123",
                role=random.choice(roles),
                phone_number=fake.unique.msisdn()[:11],
            )

            users.append(user)

        self.stdout.write(self.style.SUCCESS(f"{count} users created"))

        # -----------------------
        # OTP SEEDING
        # -----------------------
        otps = []

        for user in users:
            for _ in range(random.randint(1, 3)):
                otp = OTPVerification(
                    user=user,
                    code=str(random.randint(100000, 999999)),
                    purpose=random.choice(['login', 'reset_password']),
                    is_used=random.choice([True, False]),
                    expires_at=timezone.now() + timedelta(minutes=5)
                )
                otps.append(otp)

        OTPVerification.objects.bulk_create(otps)

        self.stdout.write(self.style.SUCCESS(f"{len(otps)} OTP records created"))