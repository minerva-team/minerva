from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count
from decimal import Decimal
from datetime import date
import random

from faker import Faker

from payroll.models import Payslip
from finance.models import Category, Transaction

fake = Faker('fa_IR')

class Command(BaseCommand):
    help = "Seed Finance app safely (idempotent, localized for Iran)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--misc-per-category',
            type=int,
            default=15,
            help="Number of demo transactions per non-payroll category"
        )

    def handle(self, *args, **kwargs):
        target_per_category = kwargs["misc_per_category"]

        with transaction.atomic():
            # =====================================================
            # 1. Create / Update Categories (فارسی و سازمانی)
            # =====================================================
            categories = {
                "Income": [
                    "درآمد فروش محصولات",
                    "درآمد ارائه خدمات",
                    "سایر درآمدهای عملیاتی",
                ],
                "Expense": [
                    "هزینه حقوق و دستمزد",
                    "اجاره دفتر مرکزی",
                    "هزینه آب، برق و اینترنت",
                    "خرید تجهیزات اداری و فنی"
                ],
            }

            for category_type, names in categories.items():
                for name in names:
                    Category.objects.update_or_create(
                        name=name,
                        defaults={
                            "type": category_type
                        }
                    )

            self.stdout.write(self.style.SUCCESS("✓ دسته‌بندی‌های مالی ایجاد شدند"))

            # =====================================================
            # 2. Create Payroll Transactions
            # =====================================================
            payroll_category = Category.objects.get(
                name="هزینه حقوق و دستمزد",
                type="Expense"
            )

            payslips = list(
                Payslip.objects
                .select_related("employee")
                .all()
            )

            if not payslips:
                self.stdout.write(self.style.WARNING("⚠ هیچ فیش حقوقی یافت نشد. ابتدا seeder بخش Payroll را اجرا کنید."))
            else:
                existing_transactions = set(
                    Transaction.objects
                    .filter(payslip__in=payslips)
                    .values_list("payslip_id", flat=True)
                )

                payroll_transactions = []

                for payslip in payslips:
                    if payslip.id in existing_transactions:
                        continue
                    
                    if payslip.status != 'Paid':
                        continue

                    payroll_transactions.append(
                        Transaction(
                            category=payroll_category,
                            payslip=payslip,
                            amount=payslip.net_salary,
                            description=f"پرداخت حقوق پرسنل - {payslip.employee.employee_code}",
                            date=(
                                payslip.created_at.date()
                                if hasattr(payslip, "created_at")
                                else date.today()
                            )
                        )
                    )

                if payroll_transactions:
                    Transaction.objects.bulk_create(payroll_transactions)

                self.stdout.write(
                    self.style.SUCCESS(f"✓ {len(payroll_transactions)} تراکنش پرداختی حقوق ثبت شد")
                )

            # =====================================================
            # 3. Create Demo Transactions (تراکنش‌های متفرقه)
            # =====================================================
            demo_categories = Category.objects.filter(
                name__in=[
                    "درآمد فروش محصولات",
                    "درآمد ارائه خدمات",
                    "سایر درآمدهای عملیاتی",
                    "اجاره دفتر مرکزی",
                    "هزینه آب، برق و اینترنت",
                    "خرید تجهیزات اداری و فنی"
                ]
            )

            existing_counts = {
                item["category_id"]: item["count"]
                for item in
                Transaction.objects
                .filter(category__in=demo_categories)
                .values("category_id")
                .annotate(count=Count("id"))
            }

            demo_transactions = []

            for category in demo_categories:
                current_count = existing_counts.get(category.id, 0)
                required = max(0, target_per_category - current_count)

                for _ in range(required):
                    if category.type == "Income":
                        amount = Decimal(random.randint(50, 500) * 1000000)
                    else:
                        amount = Decimal(random.randint(2, 50) * 1000000)

                    demo_transactions.append(
                        Transaction(
                            category=category,
                            payslip=None,
                            amount=amount,
                            description=fake.text(max_nb_chars=40),
                            date=fake.date_between(
                                start_date="-180d",
                                end_date="today"
                            )
                        )
                    )

            if demo_transactions:
                Transaction.objects.bulk_create(demo_transactions)

            self.stdout.write(
                self.style.SUCCESS(f"✓ {len(demo_transactions)} تراکنش مالی فیک ایجاد شد")
            )

            self.stdout.write(self.style.SUCCESS("✅ Seeding بخش مالی با موفقیت به پایان رسید."))