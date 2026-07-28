import { apiFetch } from './client';

export function getMyPayslips() {
  return apiFetch('/payroll/payslips/');
}

export function getAllPayslips(params) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/payroll/payslips/?${query}`);
}

export function payPayslip(id, data) {
  return apiFetch(`/payroll/payslips/${id}/pay/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}