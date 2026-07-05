import { apiFetch } from "./client";

export function requestOtp(email) {
  return apiFetch("/auth/request-otp/", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

export function verifyOtp(email, code) {
  return apiFetch("/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
    }),
  });
}