export default function AttendanceLeave() {
  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      {/* ================================================= */}
      {/* Attendance Section (Minimal Apple-style)          */}
      {/* ================================================= */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            وضعیت حضور
          </h1>
          <p className="mt-1 text-sm text-white/50">
            زمان‌های ثبت‌شده شما در سیستم برای امروز
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Current Status */}
          <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
            <p className="mb-2 text-xs font-medium text-white/50">وضعیت فعلی</p>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
              </span>
              <p className="text-lg font-medium tracking-wide text-white">
                مشغول کار
              </p>
            </div>
          </div>

          {/* Check In */}
          <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
            <p className="mb-2 text-xs font-medium text-white/50">
              آخرین زمان ورود
            </p>
            <p className="font-mono text-lg font-medium text-white">07:12</p>
          </div>

          {/* Check Out */}
          <div className="rounded-2xl bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
            <p className="mb-2 text-xs font-medium text-white/50">
              آخرین زمان خروج
            </p>
            <p className="font-mono text-lg font-medium text-white">13:05</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="
              w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium text-white 
              transition-all hover:opacity-90 active:scale-95 sm:w-auto
            "
          >
            ثبت ورود
          </button>
          <button
            className="
              w-full rounded-xl bg-primaryC px-8 py-3.5 text-sm font-medium text-white 
              transition-all hover:opacity-90 active:scale-95 sm:w-auto
            "
          >
            ثبت خروج
          </button>
        </div>
      </section>

      {/* ================================================= */}
      {/* Leave Request Section (Minimal Apple-style)       */}
      {/* ================================================= */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            درخواست مرخصی
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {/* Leave Type */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              htmlFor="leave-type"
              className="text-xs font-medium text-white/60 pl-1"
            >
              نوع مرخصی
            </label>
            <select
              id="leave-type"
              className="
                w-full appearance-none rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            >
              <option className="bg-[#1c1c1e]">مرخصی استحقاقی</option>
              <option className="bg-[#1c1c1e]">مرخصی استعلاجی</option>
              <option className="bg-[#1c1c1e]">مرخصی بدون حقوق</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="start-date"
              className="text-xs font-medium text-white/60 pl-1"
            >
              تاریخ شروع
            </label>
            <input
              id="start-date"
              type="date"
              className="
                w-full rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]
                [color-scheme:dark]
              "
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="end-date"
              className="text-xs font-medium text-white/60 pl-1"
            >
              تاریخ پایان
            </label>
            <input
              id="end-date"
              type="date"
              className="
                w-full rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]
                [color-scheme:dark]
              "
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              htmlFor="description"
              className="text-xs font-medium text-white/60 pl-1"
            >
              توضیحات (اختیاری)
            </label>
            <textarea
              id="description"
              rows="3"
              className="
                w-full resize-none rounded-xl border border-white/[0.04] bg-white/[0.03]
                px-4 py-3.5 text-sm text-white outline-none transition-all
                hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="
              w-full rounded-xl bg-primaryC px-10 py-3.5 text-sm font-medium text-white 
              transition-all hover:opacity-90 active:scale-95 sm:w-auto
            "
          >
            ارسال درخواست
          </button>
        </div>
      </section>
    </div>
  )
}
