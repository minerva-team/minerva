// Mock data
const salaryData = {
  period: {
    year: 1404,
    month: 3,
  },

  summary: {
    received: 277234000,
    deductions: 66000000,
    net: 211234000,
  },

  transactions: [
    {
      id: 1,
      date: '1404/03/31',
      description: 'حقوق پایه',
      type: 'income',
      amount: 277234000,
    },
    {
      id: 2,
      date: '1404/03/31',
      description: 'بیمه',
      type: 'deduction',
      amount: 66000000,
    },
  ],
}

const formatPrice = (amount) => {
  return new Intl.NumberFormat('fa-IR').format(amount)
}

export default function Salary() {
  const { summary, transactions } = salaryData

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      {/* ================================================= */}
      {/* Header                                            */}
      {/* ================================================= */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              فیش حقوقی
            </h1>

            <p className="mt-1 text-sm text-white/50">
              مشاهده جزئیات حقوق و دریافتی‌های شما
            </p>
          </div>

          <button
            className="
              rounded-xl bg-primaryC px-6 py-3 text-sm font-medium text-white
              transition-all hover:opacity-90 active:scale-95
            "
          >
            چاپ فیش حقوقی
          </button>
        </div>
      </section>

      {/* ================================================= */}
      {/* Filters                                           */}
      {/* ================================================= */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Year */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="salary-year"
              className="pl-1 text-xs font-medium text-white/60"
            >
              سال
            </label>

            <select
              id="salary-year"
              defaultValue={salaryData.period.year}
              className="
                w-full appearance-none rounded-xl border border-white/[0.04]
                bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none
                transition-all hover:bg-white/[0.05]
                focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            >
              <option value="1404" className="bg-[#1c1c1e]">
                ۱۴۰۴
              </option>

              <option value="1403" className="bg-[#1c1c1e]">
                ۱۴۰۳
              </option>
            </select>
          </div>

          {/* Month */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="salary-month"
              className="pl-1 text-xs font-medium text-white/60"
            >
              ماه
            </label>

            <select
              id="salary-month"
              defaultValue={salaryData.period.month}
              className="
                w-full appearance-none rounded-xl border border-white/[0.04]
                bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none
                transition-all hover:bg-white/[0.05]
                focus:border-primaryC/50 focus:bg-white/[0.06]
              "
            >
              <option value="1" className="bg-[#1c1c1e]">
                فروردین
              </option>

              <option value="2" className="bg-[#1c1c1e]">
                اردیبهشت
              </option>

              <option value="3" className="bg-[#1c1c1e]">
                خرداد
              </option>

              <option value="4" className="bg-[#1c1c1e]">
                تیر
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* Salary Summary                                    */}
      {/* ================================================= */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Received */}
        <div className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6">
          <p className="mb-3 text-sm text-white/50">مبلغ دریافتی</p>

          <p className="text-2xl font-semibold text-green-400">
            {formatPrice(summary.received)}
          </p>

          <p className="mt-2 text-xs text-white/40">ریال</p>
        </div>

        {/* Deductions */}
        <div className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6">
          <p className="mb-3 text-sm text-white/50">کسورات</p>

          <p className="text-2xl font-semibold text-red-400">
            {formatPrice(summary.deductions)}
          </p>

          <p className="mt-2 text-xs text-white/40">ریال</p>
        </div>

        {/* Net Salary */}
        <div className="rounded-3xl border border-primaryC/20 bg-primaryC/[0.08] p-6">
          <p className="mb-3 text-sm text-white/50">مبلغ نهایی</p>

          <p className="text-2xl font-semibold text-primaryC">
            {formatPrice(summary.net)}
          </p>

          <p className="mt-2 text-xs text-white/40">ریال</p>
        </div>
      </section>

      {/* ================================================= */}
      {/* Transactions                                      */}
      {/* ================================================= */}
      <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">جزئیات فیش حقوقی</h2>

          <p className="mt-1 text-sm text-white/50">
            جزئیات دریافتی‌ها و کسورات حقوق شما
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/50">
                <th className="pb-4 font-medium">تاریخ</th>
                <th className="pb-4 font-medium">شرح تراکنش</th>
                <th className="pb-4 font-medium">نوع</th>
                <th className="pb-4 font-medium">مبلغ</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const isIncome = transaction.type === 'income'

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="py-5 text-white/70">{transaction.date}</td>

                    <td className="py-5 font-medium text-white">
                      {transaction.description}
                    </td>

                    <td className="py-5">
                      <span
                        className={
                          isIncome
                            ? 'rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400'
                            : 'rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400'
                        }
                      >
                        {isIncome ? 'دریافتی' : 'کسورات'}
                      </span>
                    </td>

                    <td
                      className={`py-5 font-medium ${
                        isIncome ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatPrice(transaction.amount)} ریال
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
