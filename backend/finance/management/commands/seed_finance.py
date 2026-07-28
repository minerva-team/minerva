from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count
from decimal import Decimal
from datetime import date
import random

from faker import Faker

from payroll.models import Payslip
from finance.models import Category, Transaction


fake = Faker()


class Command(BaseCommand):
    help = "Seed Finance app safely (idempotent)"


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
            # 1. Create / Update Categories
            # =====================================================

            categories = {
                "Income": [
                    "Salary Income",
                    "Bonus",
                    "Other Income",
                ],

                "Expense": [
                    "Payroll Expense",
                    "Office Rent",
                    "Utilities",
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


            self.stdout.write(
                self.style.SUCCESS(
                    "Categories ready"
                )
            )


            # =====================================================
            # 2. Create Payroll Transactions
            # =====================================================

            payroll_category = Category.objects.get(
                name="Payroll Expense",
                type="Expense"
            )


            payslips = list(
                Payslip.objects
                .select_related("employee")
                .all()
            )


            if not payslips:

                self.stdout.write(
                    self.style.WARNING(
                        "No payslips found. Run payroll seeder first."
                    )
                )

            else:


                existing_transactions = set(
                    Transaction.objects
                    .filter(
                        payslip__in=payslips
                    )
                    .values_list(
                        "payslip_id",
                        flat=True
                    )
                )


                payroll_transactions = []


                for payslip in payslips:


                    if payslip.id in existing_transactions:
                        continue


                    payroll_transactions.append(

                        Transaction(

                            category=payroll_category,

                            payslip=payslip,

                            amount=payslip.net_salary,

                            description=(
                                f"Salary payment for "
                                f"{payslip.employee.employee_code}"
                            ),

                            date=(
                                payslip.created_at.date()
                                if hasattr(payslip, "created_at")
                                else date.today()
                            )
                        )
                    )


                if payroll_transactions:

                    Transaction.objects.bulk_create(
                        payroll_transactions
                    )


                self.stdout.write(
                    self.style.SUCCESS(
                        f"{len(payroll_transactions)} payroll transactions created"
                    )
                )



            # =====================================================
            # 3. Create Demo Transactions
            # =====================================================


            demo_categories = Category.objects.filter(
                name__in=[
                    "Salary Income",
                    "Bonus",
                    "Other Income",
                    "Office Rent",
                    "Utilities",
                ]
            )


            # Existing count in one query

            existing_counts = {

                item["category_id"]: item["count"]

                for item in
                Transaction.objects
                .filter(
                    category__in=demo_categories
                )
                .values(
                    "category_id"
                )
                .annotate(
                    count=Count("id")
                )
            }



            demo_transactions = []


            for category in demo_categories:


                current_count = existing_counts.get(
                    category.id,
                    0
                )


                required = max(
                    0,
                    target_per_category - current_count
                )


                for _ in range(required):


                    if category.type == "Income":

                        amount = (
                            Decimal(
                                random.randint(
                                    50000,
                                    2000000
                                )
                            )
                            /
                            Decimal("100")
                        )


                    else:

                        amount = (
                            Decimal(
                                random.randint(
                                    20000,
                                    800000
                                )
                            )
                            /
                            Decimal("100")
                        )



                    demo_transactions.append(

                        Transaction(

                            category=category,

                            payslip=None,

                            amount=amount,

                            description=fake.sentence(
                                nb_words=6
                            ),

                            date=fake.date_between(
                                start_date="-180d",
                                end_date="today"
                            )
                        )
                    )



            if demo_transactions:

                Transaction.objects.bulk_create(
                    demo_transactions
                )


            self.stdout.write(
                self.style.SUCCESS(
                    f"{len(demo_transactions)} demo transactions created"
                )
            )



            self.stdout.write(
                self.style.SUCCESS(
                    "Finance seeding completed successfully"
                )
            )