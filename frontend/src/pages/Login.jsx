// import { Navigate, useNavigate } from "react-router-dom"

// export default function Login() {
//   const navigate = useNavigate()

//   const token = localStorage.getItem("access")

//   if (token) {
//     return <Navigate to="/dashboard" replace />
//   }

//   const handleLogin = () => {
//     localStorage.setItem("access", "fake-token")
//     navigate("/dashboard")
//   }

//   return (
//     <div>
//       <h1>Login Page</h1>
//       <button onClick={handleLogin}>Login</button>
//     </div>
//   )
// }
import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const token = localStorage.getItem("access")
  
  // استیت برای کنترل مراحل (۱: گرفتن شماره/ایمیل، ۲: گرفتن کد تایید)
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState("")
  const [otp, setOtp] = useState("")

  // اگر توکن داشت، مستقیم بره داشبورد
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  // هندل کردن مرحله اول
  const handleRequestCode = (e) => {
    e.preventDefault()
    // اینجا بعدا درخواست به بک‌اند ارسال میشه
    if (identifier) setStep(2)
  }

  // هندل کردن مرحله دوم و ورود نهایی
  const handleVerifyOtp = (e) => {
    e.preventDefault()
    // اینجا بعدا کد به بک‌اند فرستاده میشه و توکن دریافت میشه
    localStorage.setItem("access", "fake-token") // فعلا تستی
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans text-zinc-900">
      
      {/* کانتینر اصلی فرم */}
      <div className="w-full max-w-[400px] p-8 bg-white rounded-3xl shadow-sm border border-zinc-100">
        
        {/* هدر */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl mb-4 flex items-center justify-center">
            {/* جایگاه لوگوی مینروا */}
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === 1 ? "Welcome Back" : "Check your messages"}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {step === 1 
              ? "Enter your email or phone number to continue" 
              : `We've sent a code to ${identifier}`
            }
          </p>
        </div>

        {/* فرم مرحله اول */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-zinc-700">
                Email or Phone
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {/* فرم مرحله دوم */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-zinc-700">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="• • • • • •"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-center tracking-[1em] font-mono text-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}

      </div>
    </div>
  )
}