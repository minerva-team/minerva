import React, { useState, useEffect } from 'react';
import { Search, Calculator, DollarSign, Download, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { getPayslips, updatePayslipStatus, payPayslip, downloadPayslipPdfApi } from '@/api/payroll';

const MONTH_NAMES = {
  1: 'فروردین', 2: 'اردیبهشت', 3: 'خرداد', 4: 'تیر', 
  5: 'مرداد', 6: 'شهریور', 7: 'مهر', 8: 'آبان', 
  9: 'آذر', 10: 'دی', 11: 'بهمن', 12: 'اسفند'
};

export default function FinanceControlCenter() {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAllPayslips = async () => {
    try {
      const data = await getPayslips();
      setPayslips(data.results || data);
    } catch (error) {
      console.error("خطا در دریافت لیست فیش‌ها:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPayslips();
  }, []);

  const handleAction = async (actionType, id) => {
    setActionLoading(`${actionType}-${id}`);
    try {
      if (actionType === 'approve') {
        await updatePayslipStatus(id, 'Approved');
      } else if (actionType === 'pay') {
        await payPayslip(id, { category_id: 1, description: 'پرداخت حقوق ماهانه' });
      }
      
      await fetchAllPayslips();
    } catch (error) {
      console.error("عملیات با خطا مواجه شد:", error);
      alert('خطایی در انجام عملیات رخ داد.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async (id, year, month) => {
    setActionLoading(`download-${id}`);
    try {
      const blob = await downloadPayslipPdfApi(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Minerva_Payslip_${year}_${MONTH_NAMES[month] || month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("دانلود با خطا مواجه شد", error);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPayroll = payslips.reduce((acc, curr) => acc + (Number(curr.net_salary) || 0), 0);
  const pendingCount = payslips.filter(p => p.status === 'Draft' || p.status === 'Approved').length;
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return <span className="flex w-max items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-[11px] text-emerald-400"><CheckCircle size={12}/> پرداخت شده</span>;
      case 'Approved': return <span className="flex w-max items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-[11px] text-blue-400"><CheckCircle size={12}/> تایید شده</span>;
      case 'Draft': return <span className="flex w-max items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-[11px] text-amber-400"><Clock size={12}/> پیش‌نویس</span>;
      default: return <span className="flex w-max items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 font-medium text-[11px] text-white/50"><AlertCircle size={12}/> نامشخص</span>;
    }
  };

  const filteredPayslips = payslips.filter(p => 
    p.employee_name?.includes(searchTerm) || 
    p.employee_code?.includes(searchTerm)
  );

  return (
    <div className="w-full space-y-8 text-white" dir="rtl">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white/90">مدیریت حقوق و دستمزد</h1>
          <p className="text-sm text-white/50">مرکز کنترل و پرداخت فیش‌های حقوقی پرسنل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
          <span className="font-medium text-xs text-white/40">مجموع پرداختی کل اسناد</span>
          <span className="text-2xl font-bold text-white">{totalPayroll.toLocaleString('fa-IR')} <span className="font-normal text-sm text-white/30">تومان</span></span>
        </div>
        <div className="flex flex-col gap-2 rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
          <span className="font-medium text-xs text-white/40">فیش‌های در انتظار پرداخت</span>
          <span className="text-2xl font-bold text-amber-400">{pendingCount} <span className="font-normal text-sm text-white/30">سند</span></span>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.04] p-5">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="جستجو نام یا کد پرسنلی..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/[0.04] bg-white/[0.02] py-2.5 pl-11 pr-11 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.04]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-white/[0.02] font-medium text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-6 py-4">پرسنل</th>
                <th className="px-6 py-4">دوره مالی</th>
                <th className="px-6 py-4">مبلغ خالص (تومان)</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {isLoading ? (
                <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="mx-auto animate-spin text-white/20" /></td></tr>
              ) : filteredPayslips.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-white/40">موردی یافت نشد.</td></tr>
              ) : filteredPayslips.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white/90">{row.employee_name || 'نامشخص'}</span>
                      <span className="text-[11px] text-white/40">{row.employee_code || `ID: ${row.employee}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">{MONTH_NAMES[row.month]} {row.year}</td>
                  <td className="px-6 py-4 font-mono font-medium text-white/90">{Number(row.net_salary).toLocaleString('fa-IR')}</td>
                  <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {row.status === 'Draft' && (
                        <button 
                          onClick={() => handleAction('approve', row.id)}
                          disabled={actionLoading !== null}
                          className="rounded-lg bg-blue-500/10 px-3 py-1.5 font-medium text-[11px] text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
                        >
                          {actionLoading === `approve-${row.id}` ? '...' : 'تایید مدیر'}
                        </button>
                      )}
                      {row.status === 'Approved' && (
                        <button 
                          onClick={() => handleAction('pay', row.id)}
                          disabled={actionLoading !== null}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 font-medium text-[11px] text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <DollarSign size={14} />
                          {actionLoading === `pay-${row.id}` ? '...' : 'ثبت پرداخت'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownloadPDF(row.id, row.year, row.month)}
                        disabled={actionLoading === `download-${row.id}`}
                        className="rounded-lg border border-white/[0.04] p-1.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                      >
                        {actionLoading === `download-${row.id}` ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}