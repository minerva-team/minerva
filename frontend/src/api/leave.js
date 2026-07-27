// src/api/leave.js
import { apiFetch, apiPost } from './client' 

// ==========================================
// 1. توابع مربوط به کارمندان (Employee)
// ==========================================

export function getLeaveTypes() {
  return apiFetch('/hr/leave-types/')
}

export function submitLeaveRequest(data) {
  return apiPost('/hr/leave-requests/', data)
}

export function getMyLeaveRequests() {
  return apiFetch('/hr/leave-requests/')
}


// ==========================================
// 2. توابع مربوط به مدیر منابع انسانی (HR Manager)
// ==========================================

export function getAllLeaveRequests() {
  return apiFetch('/hr/leave-requests/')
}

export function approveLeave(id) {
  return apiPost(`/hr/leave-requests/${id}/approve/`, {})
}

export function rejectLeave(id) {
  return apiPost(`/hr/leave-requests/${id}/reject/`, {})
}