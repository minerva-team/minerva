// src/api/leave.js
import { apiFetch } from './client'

export function getLeaveTypes() {
  return apiFetch('/hr/leave-types/')
}

export function submitLeaveRequest(data) {
  return apiFetch('/hr/leave-requests/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}