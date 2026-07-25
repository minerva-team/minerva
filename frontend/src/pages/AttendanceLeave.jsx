import { useEffect, useState } from 'react'
import { getAttendance, clockIn, clockOut } from '@/api/attendance'

export default function AttendanceLeave() {
  const [attendance, setAttendance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const data = await getAttendance()
        setAttendance(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const todayAttendance = attendance?.results?.find(
    (record) => record.date === today
  )

  async function handleClockIn() {
    setError('')
    setIsClockingIn(true)

    try {
      await clockIn({
        date: today,
        clock_in: new Date().toISOString(),
        status: 'Present',
      })

      const data = await getAttendance()
      setAttendance(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsClockingIn(false)
    }
  }

  async function handleClockOut() {
    setError('')
    setIsClockingOut(true)

    try {
      await clockOut()

      const data = await getAttendance()
      setAttendance(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsClockingOut(false)
    }
  }

  function formatTime(dateTime) {
    if (!dateTime) return '--:--'

    return new Date(dateTime).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusText(status) {
    switch (status) {
      case 'Present':
        return 'مشغول کار'
      case 'Absent':
        return 'غایب'
      case 'On Leave':
        return 'در مرخصی'
      default:
        return 'ثبت نشده'
    }
  }

  function getStatusColors(status) {
    switch (status) {
      case 'Present':
        return {
          ping: 'bg-green-400',
          dot: 'bg-green-500',
        }

      case 'Absent':
        return {
          ping: 'bg-red-400',
          dot: 'bg-red-500',
        }

      case 'On Leave':
        return {
          ping: 'bg-yellow-400',
          dot: 'bg-yellow-500',
        }

      default:
        return {
          ping: 'bg-gray-400',
          dot: 'bg-gray-500',
        }
    }
  }

  const statusColors = getStatusColors(todayAttendance?.status)

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      {/* Attendance Section */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            وضعیت حضور
          </h1>

          <p className="mt-1 text-sm text-white/50">
            زمان‌های ثبت‌شده شما در سیستم برای امروز
          </p>
        </div>

        {isLoading && (
          <p className="text-sm text-white/50">در حال دریافت اطلاعات حضور...</p>
        )}

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Current Status */}
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">
                  وضعیت فعلی
                </p>

                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColors.ping}`}
                    />

                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusColors.dot}`}
                    />
                  </span>

                  <p className="text-lg font-medium tracking-wide text-white">
                    {getStatusText(todayAttendance?.status)}
                  </p>
                </div>
              </div>

              {/* Check In */}
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">
                  آخرین زمان ورود
                </p>

                <p className="font-mono text-lg font-medium text-white">
                  {formatTime(todayAttendance?.clock_in)}
                </p>
              </div>

              {/* Check Out */}
              <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
                <p className="mb-2 text-xs font-medium text-white/50">
                  آخرین زمان خروج
                </p>

                <p className="font-mono text-lg font-medium text-white">
                  {formatTime(todayAttendance?.clock_out)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* Clock In */}
              <button
                onClick={handleClockIn}
                disabled={isClockingIn || Boolean(todayAttendance?.clock_in)}
                className="
                  w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium
                  text-white transition-all hover:opacity-90 active:scale-95
                  disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto
                "
              >
                {isClockingIn
                  ? 'در حال ثبت...'
                  : todayAttendance?.clock_in
                    ? 'ورود ثبت شده'
                    : 'ثبت ورود'}
              </button>

              {/* Clock Out */}
              <button
                onClick={handleClockOut}
                disabled={
                  isClockingOut ||
                  !todayAttendance?.clock_in ||
                  Boolean(todayAttendance?.clock_out)
                }
                className="
                  w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium
                  text-white transition-all hover:opacity-90 active:scale-95
                  disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto
                "
              >
                {isClockingOut
                  ? 'در حال ثبت...'
                  : todayAttendance?.clock_out
                    ? 'خروج ثبت شده'
                    : 'ثبت خروج'}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Leave Request Section */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            درخواست مرخصی
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              htmlFor="leave-type"
              className="pl-1 text-xs font-medium text-white/60"
            >
              نوع مرخصی
            </label>

            <select
              id="leave-type"
              className="
                w-full appearance-none rounded-xl border border-white/[0.04]
                bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none
                transition-all hover:bg-white/[0.05]
                focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            >
              <option className="bg-[#1c1c1e]">مرخصی استحقاقی</option>
              <option className="bg-[#1c1c1e]">مرخصی استعلاجی</option>
              <option className="bg-[#1c1c1e]">مرخصی بدون حقوق</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="start-date"
              className="pl-1 text-xs font-medium text-white/60"
            >
              تاریخ شروع
            </label>

            <input
              id="start-date"
              type="date"
              className="
                w-full rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50
                focus:bg-white/[0.06] [color-scheme:dark]
              "
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="end-date"
              className="pl-1 text-xs font-medium text-white/60"
            >
              تاریخ پایان
            </label>

            <input
              id="end-date"
              type="date"
              className="
                w-full rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50
                focus:bg-white/[0.06] [color-scheme:dark]
              "
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              htmlFor="description"
              className="pl-1 text-xs font-medium text-white/60"
            >
              توضیحات (اختیاری)
            </label>

            <textarea
              id="description"
              rows="3"
              className="
                w-full resize-none rounded-xl border border-white/[0.04]
                bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none
                transition-all hover:bg-white/[0.05]
                focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="
              w-full rounded-xl bg-primaryC px-10 py-3.5 text-sm font-medium
              text-white transition-all hover:opacity-90 active:scale-95 sm:w-auto
            "
          >
            ارسال درخواست
          </button>
        </div>
      </section>
    </div>
  )
}
