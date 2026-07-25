import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAllLeaveRequests, approveLeave, rejectLeave } from '@/api/leave' 

export default function HrLeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaves = async () => {
    setIsLoading(true)
    try {
      const data = await getAllLeaveRequests()
      setLeaves(data.results || data) 
    } catch (error) {
      toast.error('خطا در دریافت لیست مرخصی‌ها از سرور')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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

  // هندل کردن تایید و رد با API
  const handleStatusChange = async (id, newStatus) => {
    // برای اینکه دکمه رو زد، سریع نوتیف لودینگ بیاد
    const toastId = toast.loading('در حال اعمال تغییرات...')
    
    try {
      if (newStatus === 'Approved') {
        await approveLeave(id)
        toast.success('مرخصی با موفقیت تایید شد', { id: toastId })
      } else if (newStatus === 'Rejected') {
        await rejectLeave(id)
        toast.success('مرخصی رد شد', { id: toastId })
      }

      // آپدیت کردن استیت لوکال برای اینکه صفحه سریع رفرش بشه و کاربر معطل نمونه
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === id ? { ...leave, status: newStatus } : leave
        )
      )
    } catch (error) {
      toast.error('خطا در برقراری ارتباط با سرور', { id: toastId })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="rounded-full bg-green-500/15 px-3.5 py-1.5 text-xs font-medium tracking-wide text-green-400">تایید شده</span>
      case 'Rejected':
        return <span className="rounded-full bg-red-500/15 px-3.5 py-1.5 text-xs font-medium tracking-wide text-red-400">رد شده</span>
      case 'Pending':
      default:
        return <span className="rounded-full bg-[#f59e0b]/15 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#fbbf24]">در انتظار بررسی</span>
    }
  }

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8 backdrop-blur-xl">
        
        <div className="mb-8 flex flex-col items-start">
          <h1 className="text-xl font-semibold tracking-tight text-white/90">
            بررسی درخواست‌های مرخصی
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            مدیریت و تعیین وضعیت مرخصی‌های پرسنل
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-white/50">در حال دریافت اطلاعات...</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:bg-white/[0.04] sm:flex-row sm:items-center"
              >
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-medium tracking-wide text-white/90">
                      {/* اینجا چک کن بک‌اند فیلد نام کارمند رو دقیقا چی برمی‌گردونه */}
                      {/* احتمالاً leave.employee.user.first_name باشه یا مشابه این */}
                      {leave.employee_name || 'کارمند'} 
                    </span>
                    <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-white/70">
                      {/* فیلد نوع مرخصی از بک‌اند */}
                      {leave.leave_type_name || leave.leave_type || 'مرخصی'} 
                    </span>
                  </div>
                  
                  <div className="text-xs text-white/50">
                    {formatPersianDate(leave.start_date)} 
                    <span className="mx-1.5 text-white/20">تا</span> 
                    {formatPersianDate(leave.end_date)}
                  </div>

                  {leave.reason && (
                    <span className="truncate max-w-[250px] text-[11px] text-white/40 transition-colors group-hover:text-white/60" title={leave.reason}>
                      {leave.reason}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {leave.status === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(leave.id, 'Approved')}
                        className="rounded-xl bg-green-500/10 px-4 py-2 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20 active:scale-95"
                      >
                        تایید
                      </button>
                      <button
                        onClick={() => handleStatusChange(leave.id, 'Rejected')}
                        className="rounded-xl bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 active:scale-95"
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
              <div className="rounded-2xl border border-dashed border-white/5 py-10 text-center text-sm text-white/30">
                درخواستی برای بررسی وجود ندارد.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}