from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date
from payroll.models import Payslip
from finance.models import Category, Transaction


class Command(BaseCommand):
    help = "Seed Finance app safely (idempotent)"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            # -------------------------
            # 1. Categories (idempotent)
            # -------------------------
            income_categories = ["Salary Income", "Bonus", "Other Income"]
            expense_categories = ["Payroll Expense", "Office Rent", "Utilities"]

            for name in income_categories:
                Category.objects.get_or_create(name=name, defaults={"type": "Income"})

            for name in expense_categories:
                Category.objects.get_or_create(name=name, defaults={"type": "Expense"})

            self.stdout.write(self.style.SUCCESS("Categories ready"))

            # -------------------------
            # 2. Payslips (source of payroll expense)
            # -------------------------
            payslips = Payslip.objects.all()

            if not payslips.exists():
                self.stdout.write(self.style.ERROR("No payslips found. Run seed_payroll first."))
                return

            transaction_count = 0

            expense_category = Category.objects.filter(
                name="Payroll Expense", type="Expense"
            ).first()

            if not expense_category:
                self.stdout.write(self.style.ERROR("Payroll Expense category missing."))
                return

            # -------------------------
            # 3. Create Transactions (یک تراکنش به ازای هر payslip — OneToOne)
            # -------------------------
            for payslip in payslips:
                # جلوگیری از duplicate transaction (OneToOne constraint)
                if hasattr(payslip, 'financial_transaction'):
                    continue

                Transaction.objects.create(
                    category=expense_category,
                    payslip=payslip,
                    amount=payslip.net_salary,
                    description=f"Salary payment for {payslip.employee.employee_code}",
                    date=date.today()
                )

                transaction_count += 1

            self.stdout.write(
                self.style.SUCCESS(f"{transaction_count} transactions created")
            )

            self.stdout.write(self.style.SUCCESS("Finance seeding completed"))