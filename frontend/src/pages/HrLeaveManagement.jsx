import { useEffect, useState } from 'react'
import { Check, X, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'


export default function HrLeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaves() {
      try {

        
        setLeaves([
          { id: 1, employee_name: 'شایان کریمی', leave_type_name: 'استحقاقی', start_date: '2026-07-28', end_date: '2026-07-30', status: 'Pending', reason: 'سفر خانوادگی' },
          { id: 2, employee_name: 'علی حسینی', leave_type_name: 'استعلاجی', start_date: '2026-07-25', end_date: '2026-07-26', status: 'Approved', reason: 'مراجعه به پزشک' },
          { id: 3, employee_name: 'سارا احمدی', leave_type_name: 'بدون حقوق', start_date: '2026-08-01', end_date: '2026-08-05', status: 'Rejected', reason: 'رسیدگی به امور شخصی' },
        ])
      } catch (error) {
        toast.error('خطا در دریافت لیست مرخصی‌ها')
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaves()
  }, [])

  const formatPersianDate = (dateString) => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fa-IR', { 
      day: 'numeric', 
      month: 'long' 
    }).format(date)
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === id ? { ...leave, status: newStatus } : leave
        )
      )

      if (newStatus === 'Approved') {
        toast.success('مرخصی با موفقیت تایید شد')
      } else {
        toast.success('مرخصی رد شد')
      }
    } catch (error) {
      toast.error('خطا در ثبت تغییرات')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 border border-green-500/20">
            <Check size={14} /> تایید شده
          </span>
        )
      case 'Rejected':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/20">
            <X size={14} /> رد شده
          </span>
        )
      case 'Pending':
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
            <Clock size={14} /> در انتظار
          </span>
        )
    }
  }

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8 backdrop-blur-xl">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            بررسی درخواست‌های مرخصی
          </h1>
          <p className="mt-1 text-sm text-white/50">
            مدیریت و تعیین وضعیت مرخصی‌های پرسنل مینروا
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-white/50">در حال دریافت اطلاعات...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.02] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
              >
                
                {/* اطلاعات کارمند و تاریخ */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-white/90">
                      {leave.employee_name}
                    </span>
                    <span className="rounded-full bg-primaryC/10 px-2.5 py-1 text-[11px] font-medium text-primaryC border border-primaryC/20">
                      {leave.leave_type_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <CalendarIcon size={14} />
                    <span>از {formatPersianDate(leave.start_date)} تا {formatPersianDate(leave.end_date)}</span>
                  </div>

                  {leave.reason && (
                    <p className="mt-1 text-sm text-white/60">
                      <span className="text-white/30">توضیحات: </span>
                      {leave.reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {leave.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(leave.id, 'Approved')}
                        className="flex items-center justify-center rounded-xl bg-green-500/10 px-4 py-2.5 text-sm font-medium text-green-400 transition-all hover:bg-green-500/20 active:scale-95"
                      >
                        تایید
                      </button>
                      <button
                        onClick={() => handleStatusChange(leave.id, 'Rejected')}
                        className="flex items-center justify-center rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                      >
                        رد
                      </button>
                    </div>
                  ) : (
                    getStatusBadge(leave.status)
                  )}
                </div>

              </div>
            ))}

            {leaves.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-white/[0.02] bg-white/[0.01]">
                <p className="text-white/40">درخواستی برای نمایش وجود ندارد.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}