import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react';

// --- Mock Data ---
const MOCK_PAYSLIPS = [
  { id: 1, year: 1402, month: 5, monthName: 'مرداد', net_salary: 1450000000, status: 'Paid' },
  { id: 2, year: 1402, month: 4, monthName: 'تیر', net_salary: 1250000000, status: 'Paid' },
  { id: 3, year: 1402, month: 3, monthName: 'خرداد', net_salary: 1300000000, status: 'Paid' },
];

export default function EmployeePayslipPortal() {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    // شبیه‌سازی دریافت اطلاعات از API
    // TODO: Replace with -> apiFetch('/api/payroll/payslips/')
    const fetchPayslips = async () => {
      setTimeout(() => {
        setPayslips(MOCK_PAYSLIPS);
        setIsLoading(false);
      }, 1000);
    };
    fetchPayslips();
  }, []);

  const handleDownloadPDF = async (id, year, monthName) => {
    setDownloadingId(id);
    try {
      // شبیه‌سازی تاخیر دانلود
      // TODO: Replace with real Blob fetch
      /*
      const response = await fetch(`http://localhost:8000/api/payroll/payslips/${id}/download-pdf/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${year}_${monthName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      */
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Download failed", error);
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {payslips.map((payslip) => (
          <div 
            key={payslip.id} 
            className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl transition-all hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.02]">
                  <FileText size={20} className="text-violet-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white/90">{payslip.monthName} {payslip.year}</span>
                  <span className="text-[11px] text-white/40 font-medium">شماره سند: #{payslip.id}</span>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400">
                <CheckCircle size={12} />
                پرداخت شده
              </span>
            </div>

            <div className="mb-8 flex flex-col">
              <span className="text-[11px] text-white/40 font-medium mb-1">خالص دریافتی</span>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {payslip.net_salary.toLocaleString('fa-IR')}
                </span>
                <span className="text-sm text-white/40 mb-1">تومان</span>
              </div>
            </div>

            <button
              onClick={() => handleDownloadPDF(payslip.id, payslip.year, payslip.monthName)}
              disabled={downloadingId === payslip.id}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50"
            >
              {downloadingId === payslip.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Download size={18} />
                  دانلود PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}