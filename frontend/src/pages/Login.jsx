import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

export default function Login({ className, ...props }) {
  useEffect(() => {
    document.title = 'مینروا | ورود'
  }, [])
  const navigate = useNavigate()
  const token = localStorage.getItem('access')

  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (token) return <Navigate to="/dashboard" replace />

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))
    setIsLoading(false)
    if (identifier) setStep(2)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    localStorage.setItem('access', 'fake-token')
    navigate('/dashboard')
  }

  return (
    <div
      dir="rtl"
      className={cn(className, 'min-h-screen flex flex-col items-center justify-center bg-backgroundC')}
      {...props}
    >
      <Card className="w-full max-w-[400px] bg-surfaceC border-mutedMatnC/50">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <img src="/minervaLogo3.svg" alt="لوگوی مینروا" />
          </div>
          <CardTitle className="text-matnC text-2xl font-semibold">
            {step === 1 ? 'ورود به مینروا' : 'رمز عبور را وارد کنید'}
          </CardTitle>
          <CardDescription className="text-mutedMatnC">
            {step === 1 ? 'برای ادامه آدرس ایمیل خود را وارد کنید' : 'رمز عبور به ایمیل شما ارسال شد'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRequestCode}
                className="flex flex-col gap-4"
              >
                <Input
                  dir="ltr"
                  id="identifier"
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full placeholder-mutedMatnC rounded-xl border-mutedMatnC/50 bg-surfaceC focus:ring-2 focus:ring-primaryC focus:ring-offset-2 focus:ring-offset-black focus:outline-none text-matnC text-sm text-center"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primaryC text-matnC rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                >
                  {isLoading ? 'در حال ارسال...' : 'دریافت رمز'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVerifyOtp}
                className="flex flex-col gap-4"
              >
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setOtp(e.target.value)
                  }}
                  placeholder="••••••"
                  className="w-full text-matnC p-4 placeholder-mutedMatnC rounded-xl border border-mutedMatnC/50 bg-surfaceC focus:ring-2 focus:ring-primaryC focus:ring-offset-2 focus:ring-offset-black focus:outline-none tracking-[1em] text-center text-lg"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-primaryC text-matnC rounded-xl text-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                >
                  ورود
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-mutedMatnC bg-transparent border-none shadow-none hover:bg-transparent"
                >
                  ورود با حساب دیگر
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

