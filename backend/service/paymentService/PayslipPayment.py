from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from payroll.models import Payslip
from finance.models import Category , Transaction


class PayslipPaymentService:

    @classmethod
    def process_payment(cls, payslip_id: int, category_id: int, payment_date=None,
                        description: str = "") -> Transaction:


        with transaction.atomic():


            try:

                payslip = Payslip.objects.select_for_update().get(pk=payslip_id)
            except Payslip.DoesNotExist:
                raise ValidationError("فیش حقوقی مورد نظر یافت نشد.")


            if payslip.status == 'Paid':
                raise ValidationError("این فیش حقوقی قبلاً پرداخت شده است.")

            if payslip.status == 'Draft':
                raise ValidationError("فیش‌های پیش‌نویس (Draft) قابل پرداخت نیستند. ابتدا باید تأیید (Approved) شوند.")


            try:
                category = Category.objects.get(pk=category_id, type='Expense')
            except Category.DoesNotExist:
                raise ValidationError("دسته‌بندی مالی نامعتبر است یا از نوع 'هزینه' نیست.")


            tx_date = payment_date or timezone.now().date()

            new_transaction = Transaction.objects.create(
                category=category,
                payslip=payslip,
                amount=payslip.net_salary,
                description=description,
                date=tx_date
            )


            payslip.status = 'Paid'

            payslip.save(update_fields=['status', 'updated_at'])

            return new_transaction