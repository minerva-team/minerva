import { ArrowRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white"
      dir="rtl"
    >
      <section className="w-full max-w-xl text-center">
        {/* Error Code */}
        <div className="mb-6">
          <span className="text-8xl font-bold tracking-tight text-primaryC/90">
            404
          </span>
        </div>

        {/* Content */}
        <h1 className="mb-3 text-2xl font-semibold text-white sm:text-3xl">
          صفحه مورد نظر یافت نشد
        </h1>

        <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-white/50 sm:text-base">
          صفحه‌ای که به دنبال آن هستید وجود ندارد، حذف شده است یا ممکن است آدرس
          آن تغییر کرده باشد.
        </p>

        {/* Action */}
        <button
          onClick={() => navigate('/dashboard')}
          className="
          inline-flex items-center gap-2 rounded-xl
          bg-primaryC px-6 py-3
          text-sm font-medium text-white
          shadow-lg shadow-primaryC/20
          transition-all duration-200
          hover:bg-primaryC/80
          hover:shadow-xl hover:shadow-primaryC/30
          active:scale-95
         "
        >
          <Home size={17} />
          <span>بازگشت به داشبورد</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </main>
  )
}
