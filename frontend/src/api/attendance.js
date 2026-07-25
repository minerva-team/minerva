import { apiFetch } from './client'

export function getAttendance() {
  return apiFetch('/hr/attendance/')
}

export function clockIn(data) {
  return apiFetch('/hr/attendance/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function clockOut() {
  return apiFetch('/hr/attendance/clock-out/', {
    method: 'POST',
  })
}
