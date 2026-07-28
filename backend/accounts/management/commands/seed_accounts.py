from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
from accounts.models import User, OTPVerification
from django.utils import timezone
from datetime import timedelta
import random

fake = Faker()


class Command(BaseCommand):
    help = "Seed users and OTP data (safe to run multiple times)"

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **kwargs):
        count = kwargs['count']

        roles = ['Admin', 'HR Manager', 'Finance Manager', 'Employee']

        # Load what's already in the DB so re-running the command
        # never collides with previously seeded rows.
        existing_emails = set(User.objects.values_list('email', flat=True))
        existing_phones = set(
            User.objects.exclude(phone_number__isnull=True).values_list('phone_number', flat=True)
        )

        with transaction.atomic():
            users = []

            for _ in range(count):
                # unique email
                while True:
                    email = fake.unique.email()
                    if email not in existing_emails:
                        existing_emails.add(email)
                        break

                # unique phone number (own generator, since msisdn()[:11] can collide after truncation)
                while True:
                    phone_number = "09" + "".join(random.choices("0123456789", k=9))
                    if phone_number not in existing_phones:
                        existing_phones.add(phone_number)
                        break

                user = User.objects.create_user(
                    email=email,
                    password="password123",
                    role=random.choice(roles),
                    phone_number=phone_number,
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