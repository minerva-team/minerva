from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date
import random
from decimal import Decimal
from hr.models import Employee, Contract
from payroll.models import PayrollConfig, Payslip


class Command(BaseCommand):
    help = "Seed Payroll app safely (idempotent)"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            # -------------------------
            # 1. Payroll Config (Singleton safe)
            # -------------------------
            config, _ = PayrollConfig.objects.get_or_create(
                id=1,
                defaults={
                    "tax_rate": Decimal("10.00"),
                    "insurance_rate": Decimal("7.00"),
                    "overtime_multiplier": Decimal("1.50"),
                }
            )
            self.stdout.write(self.style.SUCCESS("PayrollConfig ready"))

            # -------------------------
            # 2. Employees + Contracts (فقط کارمندهای فعال)
            # -------------------------
            employees = Employee.objects.filter(is_deleted=False).select_related("user")

            if not employees.exists():
                self.stdout.write(self.style.ERROR("No employees found. Run seed_hr first."))
                return

            payslip_count = 0

            # -------------------------
            # 3. Payslips (avoid duplicates per month)
            # -------------------------
            current_year = date.today().year
            current_month = date.today().month

            for emp in employees:
                # جلوگیری از duplicate payslip
                if Payslip.objects.filter(
                    employee=emp,
                    year=current_year,
                    month=current_month
                ).exists():
                    continue

                # گرفتن contract فعال
                contract = Contract.objects.filter(
                    employee=emp,
                    is_active=True
                ).first()

                if not contract:
                    continue

                gross = contract.base_salary + contract.housing_allowance + contract.transport_allowance
                tax_amount = gross * (config.tax_rate / Decimal("100"))
                insurance_amount = gross * (config.insurance_rate / Decimal("100"))
                net_salary = gross - tax_amount - insurance_amount

                Payslip.objects.create(
                    employee=emp,
                    year=current_year,
                    month=current_month,
                    status=random.choice(["Draft", "Approved", "Paid"]),
                    gross_salary=gross,
                    applied_tax_rate=config.tax_rate,
                    applied_insurance_rate=config.insurance_rate,
                    tax_amount=tax_amount,
                    insurance_amount=insurance_amount,
                    net_salary=net_salary
                )

                payslip_count += 1

            self.stdout.write(
                self.style.SUCCESS(f"{payslip_count} payslips created")
            )

            self.stdout.write(self.style.SUCCESS("Payroll seeding completed"))