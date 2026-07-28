import { useEffect, useState } from 'react'
import { getAttendance, clockIn, clockOut } from '@/api/attendance'
import DatePickerPackage from 'react-multi-date-picker'
const DatePicker = DatePickerPackage.default || DatePickerPackage
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'
import 'react-multi-date-picker/styles/colors/purple.css'
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css'
// ایمپورت‌ها دقیق و تمیز شدن
import { getLeaveTypes, submitLeaveRequest, getMyLeaveRequests } from '@/api/leave'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react' 

export default function AttendanceLeave() {
  const [attendance, setAttendance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState([])
  const [selectedLeave, setSelectedLeave] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [description, setDescription] = useState('')
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false)
  
  const [myLeaves, setMyLeaves] = useState([])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchData() {
      try {
        const [attendanceData, typesData, leavesData] = await Promise.all([
          getAttendance(),
          getLeaveTypes(),
          getMyLeaveRequests()
        ])

        setAttendance(attendanceData)
        
        setLeaveTypes(typesData.results || typesData)
        if (typesData.length > 0 || typesData.results?.length > 0) {
          setSelectedLeave(typesData.results ? typesData.results[0].id : typesData[0].id)
        }

        setMyLeaves(leavesData.results || leavesData)

      } catch (err) {
        toast.error('خطا در دریافت اطلاعات اولیه.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const todayAttendance = (attendance?.results || (Array.isArray(attendance) ? attendance : [])).find(
    (record) => record.date === today
  )

  function formatFriendlyDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      day: 'numeric',
      month: 'long',
    }).format(date);
  }

  async function handleClockIn() {
    setIsClockingIn(true)
    try {
      await clockIn({})
      const data = await getAttendance()
      setAttendance(data)
      toast.success('ورود شما با موفقیت ثبت شد.')
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ')
        toast.error(`خطا: ${errorMessages}`)
      } else {
        toast.error('مشکلی در ثبت ورود پیش آمد.')
      }
    } finally {
      setIsClockingIn(false)
    }
  }

  async function handleClockOut() {
    setIsClockingOut(true)
    try {
      await clockOut({})
      const data = await getAttendance()
      setAttendance(data)
      toast.success('خروج شما با موفقیت ثبت شد.')
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ')
        toast.error(`خطا: ${errorMessages}`)
      } else {
        toast.error('مشکلی در ثبت خروج پیش آمد.')
      }
    } finally {
      setIsClockingOut(false)
    }
  }

  function formatTime(timeValue) {
    if (!timeValue) return '--:--'
    try {
      if (typeof timeValue === 'string' && !timeValue.includes('T') && timeValue.includes(':')) {
        const [hours, minutes] = timeValue.split(':')
        const dummyDate = new Date()
        dummyDate.setHours(parseInt(hours, 10))
        dummyDate.setMinutes(parseInt(minutes, 10))
        return dummyDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
      return new Date(timeValue).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch (err) {
      return '--:--'
    }
  }

  function getStatusText(record) {
    if (!record) return 'ثبت نشده'
    if (record.clock_out) return 'پایان کار'
    switch (record.status) {
      case 'Present': return 'مشغول کار'
      case 'Absent': return 'غایب'
      case 'On Leave': return 'در مرخصی'
      default: return 'ثبت نشده'
    }
  }

  function getStatusColors(record) {
    if (!record) return { ping: 'bg-gray-400', dot: 'bg-gray-500' }
    if (record.clock_out) return { ping: 'bg-blue-400', dot: 'bg-blue-500' }
    switch (record.status) {
      case 'Present': return { ping: 'bg-green-400', dot: 'bg-green-500' }
      case 'Absent': return { ping: 'bg-red-400', dot: 'bg-red-500' }
      case 'On Leave': return { ping: 'bg-yellow-400', dot: 'bg-yellow-500' }
      default: return { ping: 'bg-gray-400', dot: 'bg-gray-500' }
    }
  }

  const statusColors = getStatusColors(todayAttendance)

  async function handleLeaveSubmit(e) {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast.error('لطفاً تاریخ شروع و پایان را انتخاب کنید.')
      return
    }

    setIsSubmittingLeave(true)
    const toastId = toast.loading('در حال ارسال درخواست...')

    try {
      const miladiStart = startDate.convert(gregorian, gregorian_en).format('YYYY-MM-DD')
      const miladiEnd = endDate.convert(gregorian, gregorian_en).format('YYYY-MM-DD')

      await submitLeaveRequest({
        leave_type: selectedLeave,
        start_date: miladiStart,
        end_date: miladiEnd,
        reason: description
      })

      toast.success('درخواست مرخصی با موفقیت ثبت شد.', { id: toastId })
      
      const updatedLeaves = await getMyLeaveRequests()
      setMyLeaves(updatedLeaves.results || updatedLeaves)

      setStartDate(null)
      setEndDate(null)
      setDescription('')
    } catch (err) {
      toast.error('مشکلی در ثبت درخواست پیش آمد.', { id: toastId })
    } finally {
      setIsSubmittingLeave(false)
    }
  }

  function getLeaveStatusStyle(status) {
      switch(status) {
        case 'Approved': return 'bg-green-500/15 text-green-400' 
        case 'Rejected': return 'bg-red-500/15 text-red-400'
        default: return 'bg-[#f59e0b]/15 text-[#fbbf24]'
      }
    }

  function getLeaveStatusText(status) {
    switch(status) {
      case 'Approved': return 'تایید شده'
      case 'Rejected': return 'رد شده'
      default: return 'در انتظار بررسی'
    }
  }

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">وضعیت حضور</h1>
          <p className="mt-1 text-sm text-white/50">زمان‌های ثبت‌شده شما در سیستم برای امروز</p>
        </div>

        {isLoading && <p className="text-sm text-white/50">در حال دریافت اطلاعات حضور...</p>}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">وضعیت فعلی</p>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColors.ping}`} />
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusColors.dot}`} />
                  </span>
                  <p className="text-lg font-medium tracking-wide text-white">{getStatusText(todayAttendance)}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">آخرین زمان ورود</p>
                <p className="font-mono text-lg font-medium text-white">{formatTime(todayAttendance?.clock_in)}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">آخرین زمان خروج</p>
                <p className="font-mono text-lg font-medium text-white">{formatTime(todayAttendance?.clock_out)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleClockIn}
                disabled={isClockingIn || Boolean(todayAttendance?.clock_in)}
                className="w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isClockingIn ? 'در حال ثبت...' : todayAttendance?.clock_in ? 'ورود ثبت شده' : 'ثبت ورود'}
              </button>
              <button
                onClick={handleClockOut}
                disabled={isClockingOut || !todayAttendance?.clock_in || Boolean(todayAttendance?.clock_out)}
                className="w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isClockingOut ? 'در حال ثبت...' : todayAttendance?.clock_out ? 'خروج ثبت شده' : 'ثبت خروج'}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">درخواست مرخصی</h2>
        </div>

        <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="pl-1 text-xs font-medium text-white/60">نوع مرخصی</label>
            <select
              value={selectedLeave}
              onChange={(e) => setSelectedLeave(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]"
            >
              {Array.isArray(leaveTypes) && leaveTypes.map((type) => (
                <option key={type.id} value={type.id} className="bg-[#1c1c1e]">{type.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="pl-1 text-xs font-medium text-white/60">تاریخ شروع</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={startDate}
              onChange={setStartDate}
              className="purple bg-dark"
              inputClass="w-full rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]"
              placeholder="انتخاب کنید"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="pl-1 text-xs font-medium text-white/60">تاریخ پایان</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={endDate}
              onChange={setEndDate}
              className="purple bg-dark"
              inputClass="w-full rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]"
              placeholder="انتخاب کنید"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="pl-1 text-xs font-medium text-white/60">توضیحات (اختیاری)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full resize-none rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]"
            />
          </div>
          <div className="mt-8 flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={isSubmittingLeave}
              className="w-full rounded-xl bg-primaryC px-10 py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:w-auto"
            >
              {isSubmittingLeave ? 'در حال ارسال...' : 'ارسال درخواست'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        
        <div className="mb-6 flex flex-col items-start">
          <h2 className="text-xl font-semibold tracking-tight text-white/90">سوابق مرخصی‌های من</h2>
          <p className="mt-1.5 text-sm text-white/40">پیگیری وضعیت درخواست‌های ثبت‌شده</p>
        </div>

        {myLeaves.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/5 py-10 text-center text-sm text-white/30">
            هنوز هیچ درخواست مرخصی‌ای ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {myLeaves.map((leave) => (
              <div 
                key={leave.id} 
                className="group flex flex-col justify-between gap-4 rounded-2xl bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:bg-white/[0.04] sm:flex-row sm:items-center"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium tracking-wide text-white/90">
                    {leave.leave_type_name || 'مرخصی'} 
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <span>{formatFriendlyDate(leave.start_date)}</span>
                    <span className="text-white/20">تا</span>
                    <span>{formatFriendlyDate(leave.end_date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  {leave.reason && (
                    <span className="truncate max-w-[130px] text-xs text-white/30 transition-colors group-hover:text-white/50" title={leave.reason}>
                      {leave.reason}
                    </span>
                  )}
                  <span className={`rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors ${getLeaveStatusStyle(leave.status)}`}>
                    {getLeaveStatusText(leave.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}