// src/api/payroll.js
import { apiFetch } from './client';

export function getPayslips(params = '') {
  return apiFetch(`/payroll/payslips/${params ? `?${params}` : ''}`);
}

export function calculatePayslip(data) {
  return apiFetch('/payroll/payslips/calculate/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function payPayslip(id, data) {
  return apiFetch(`/payroll/payslips/${id}/pay/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePayslipStatus(id, status) {
  return apiFetch(`/payroll/payslips/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function downloadPayslipPdfApi(id) {
  const token = localStorage.getItem('access') || localStorage.getItem('access_token');
  
  const response = await fetch(`http://localhost:8000/api/payroll/payslips/${id}/download-pdf/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('خطا در دریافت فایل PDF');
  }

  return await response.blob();
}