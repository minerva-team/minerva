import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { getPayslips, downloadPayslipPdfApi } from '@/api/payroll'; 

const MONTH_NAMES = {
  1: 'فروردین', 2: 'اردیبهشت', 3: 'خرداد', 4: 'تیر', 
  5: 'مرداد', 6: 'شهریور', 7: 'مهر', 8: 'آبان', 
  9: 'آذر', 10: 'دی', 11: 'بهمن', 12: 'اسفند'
};

export default function EmployeePayslipPortal() {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchMyPayslips = async () => {
      try {
        const data = await getPayslips();
        setPayslips(data.results || data);
      } catch (error) {
        console.error("خطا در دریافت فیش‌های حقوقی:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPayslips();
  }, []);

  const handleDownloadPDF = async (id, year, month) => {
    setDownloadingId(id);
    try {
      const blob = await downloadPayslipPdfApi(id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const monthName = MONTH_NAMES[month] || month;
      link.setAttribute('download', `Minerva_Payslip_${year}_${monthName}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("دانلود با خطا مواجه شد", error);
      alert('خطا در دانلود فایل PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-white" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white/90">فیش‌های حقوقی من</h1>
        <p className="text-sm text-white/50">مشاهده و دانلود سوابق پرداختی</p>
      </div>

      {payslips.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40">
          <p className="text-white/50">فیش حقوقی برای نمایش وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {payslips.map((payslip) => (
            <div 
              key={payslip.id} 
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl transition-all hover:bg-white/[0.04]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.02] bg-white/[0.03]">
                    <FileText size={20} className="text-violet-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white/90">{MONTH_NAMES[payslip.month]} {payslip.year}</span>
                    <span className="font-medium text-[11px] text-white/40">شماره سند: #{payslip.id}</span>
                  </div>
                </div>
                
                {payslip.status === 'Paid' ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400">
                    <CheckCircle size={12} /> پرداخت شده
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-400">
                    <Clock size={12} /> در انتظار پرداخت
                  </span>
                )}
              </div>

              <div className="mb-8 flex flex-col">
                <span className="mb-1 font-medium text-[11px] text-white/40">خالص دریافتی</span>
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {Number(payslip.net_salary).toLocaleString('fa-IR')}
                  </span>
                  <span className="mb-1 text-sm text-white/40">تومان</span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF(payslip.id, payslip.year, payslip.month)}
                disabled={downloadingId === payslip.id}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50"
              >
                {downloadingId === payslip.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Download size={18} /> دانلود PDF
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}