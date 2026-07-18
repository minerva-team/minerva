import { CalendarDays, Send } from 'lucide-react'

export default function AttendanceLeave() {
  return (
    <main
      className="mh-full bg-backgroundC p-4 text-matnC sm:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-8xl space-y-6">
        {/* Attendance Card */}
        <section className="rounded-2xl bg-surfaceC p-5 shadow-sm sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl font-bold sm:text-2xl">وضعیت حضور</h1>

            <p className="mt-2 text-xs text-mutedMatnC sm:text-sm">
              وضعیت حضور و زمان‌های ثبت‌شده امروز
            </p>
          </div>

          {/* Attendance Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {/* Current Status */}
            <div className="rounded-xl border border-primaryC/10 bg-backgroundC p-4 sm:p-5">
              <p className="mb-3 text-sm text-mutedMatnC sm:mb-4">وضعیت فعلی</p>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 shrink-0 rounded-full bg-green-500" />

                <p className="text-base font-bold sm:text-lg">مشغول کار</p>
              </div>
            </div>

            {/* Check In */}
            <div className="rounded-xl border border-primaryC/10 bg-backgroundC p-4 sm:p-5">
              <p className="mb-3 text-sm text-mutedMatnC sm:mb-4">
                آخرین زمان ورود
              </p>

              <p className="text-base font-bold sm:text-lg">07:12</p>
            </div>

            {/* Check Out */}
            <div className="rounded-xl border border-primaryC/10 bg-backgroundC p-4 sm:p-5">
              <p className="mb-3 text-sm text-mutedMatnC sm:mb-4">
                آخرین زمان خروج
              </p>

              <p className="text-base font-bold sm:text-lg">13:05</p>
            </div>
          </div>

          {/* Attendance Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <button
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primaryC
                px-6
                py-3
                font-medium
                text-matnC
                transition-all
                hover:bg-primaryC/80
                active:scale-95
                sm:w-auto
                sm:px-8
              "
            >
              ثبت ورود
            </button>

            <button
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-primaryC
                px-6
                py-3
                font-medium
                text-primaryC
                transition-all
                hover:bg-primaryC/10
                active:scale-95
                sm:w-auto
                sm:px-8
              "
            >
              ثبت خروج
            </button>
          </div>
        </section>

        {/* Leave Request Card */}
        <section className="rounded-2xl bg-surfaceC p-5 shadow-sm sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold">درخواست مرخصی</h2>

            <p className="mt-2 text-xs text-mutedMatnC sm:text-sm">
              درخواست مرخصی خود را ثبت کنید
            </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Leave Type */}
            <div className="flex flex-col gap-2">
              <label htmlFor="leave-type" className="text-sm font-medium">
                نوع مرخصی
              </label>

              <select
                id="leave-type"
                className="
                  rounded-xl
                  border
                  border-primaryC/20
                  bg-backgroundC
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-primaryC
                "
              >
                <option>مرخصی استحقاقی</option>
                <option>مرخصی استعلاجی</option>
                <option>مرخصی بدون حقوق</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <label htmlFor="start-date" className="text-sm font-medium">
                تاریخ شروع
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-mutedMatnC
                  "
                />

                <input
                  id="start-date"
                  type="date"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-primaryC/20
                    bg-backgroundC
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-primaryC
                  "
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-2">
              <label htmlFor="end-date" className="text-sm font-medium">
                تاریخ پایان
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-mutedMatnC
                  "
                />

                <input
                  id="end-date"
                  type="date"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-primaryC/20
                    bg-backgroundC
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-primaryC
                  "
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label htmlFor="description" className="text-sm font-medium">
                توضیحات
              </label>

              <textarea
                id="description"
                rows="3"
                placeholder="توضیحات درخواست خود را وارد کنید..."
                className="
                  resize-none
                  rounded-xl
                  border
                  border-primaryC/20
                  bg-backgroundC
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  placeholder:text-mutedMatnC
                  focus:border-primaryC
                "
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-start">
            <button
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primaryC
                px-8
                py-3
                font-medium
                text-matnC
                transition-all
                hover:bg-primaryC/80
                active:scale-95
                sm:w-auto
              "
            >
              <Send size={18} />
              ارسال درخواست
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
