import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const navigate = useNavigate()
  const token = localStorage.getItem("access")
  
  // استیت‌های مدیریت فرم
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // اگر توکن از قبل وجود داشت، مستقیم به داشبورد هدایت شود
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  // هندل کردن مرحله اول (دریافت کد/ایمیل)
  const handleRequestCode = async (e) => {
    e.preventDefault()
    setIsLoading(true) 
    
    // شبیه‌سازی درخواست به بک‌اند (۱ ثانیه تاخیر)
    // TODO: جایگزین کردن با درخواست واقعی API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false) 
    if (identifier) setStep(2)
  }

  // هندل کردن مرحله دوم (تایید کد و ورود نهایی)
  const handleVerifyOtp = (e) => {
    e.preventDefault()
    
    // TODO: ارسال کد به بک‌اند و دریافت توکن واقعی
    localStorage.setItem("access", "fake-token") 
    navigate("/dashboard")
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans text-zinc-900">
      
      {/* کانتینر اصلی فرم */}
      <div className="w-full max-w-[400px] p-8 bg-white rounded-xl shadow-sm border border-zinc-100 animate-in fade-in zoom-in duration-2000">
        
        {/* بخش هدر و لوگو */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 rounded-xl mb-4 flex items-center justify-center">
            <img src="/minervaLogo2.jpg" alt="لوگوی مینروا" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === 1 ? "ورود به مینروا" : "رمز عبور را وارد کنید"}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {step === 1 
              ? "برای ادامه آدرس ایمیل خود را وارد کنید" 
              : "رمز عبور به ایمیل شما ارسال شد"
            }
          </p>
        </div>

        {/* فرم مرحله اول */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <Input 
                dir="ltr"
                id="identifier"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com"
                className="placeholder-mutedTextC w-full p-4 rounded-xl border border-mutedTextC/50 bg-surfaceC focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                required
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full p-2 bg-primaryC text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              {isLoading ? "در حال ارسال..." : "دریافت رمز"}
            </Button>
          </form>
        )}

        {/* فرم مرحله دوم */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  // فیلتر کردن: فقط اعداد وارد شوند
                  if (/^\d*$/.test(value)) {
                    setOtp(value);
                  }
                }}
                placeholder="• • • • • •"
                className="placeholder-mutedTextC w-full p-2 rounded-xl border border-mutedTextC/50 bg-surfaceC focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-center tracking-[1em] font-mono text-lg"
                required
              />
            <Button
              type="submit"
              className="w-full py-2 bg-primaryC text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              ورود
            </Button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              ایمیل دیگری وارد کنید
            </button>
          </form>
        )}

      </div>
    </div>
  )
}