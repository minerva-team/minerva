// src/api/client.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiFetch(endpoint, options = {}) {

  const token = localStorage.getItem('access')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  })

  let data = {}
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('API response is not valid JSON:', text)
      data = { detail: 'پاسخ نامعتبر از سمت سرور' }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('توکن نامعتبر است. خروج خودکار...')
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      
    }

    throw new Error(data.detail || data.message || 'خطایی در ارتباط با سرور رخ داد')
  }

  return data
}

export async function apiPost(endpoint, bodyData = {}) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(bodyData),
  })
}