import React, { useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, X, CheckCircle, FileText, Clock, AlertCircle } from 'lucide-react';

// ==========================================
// MOCK DATA (Role-Based Datasets)
// ==========================================

const db = {
  // Admin Data
  admin: {
    kpis: [
      { label: 'سود خالص این ماه (تومان)', value: '۸۵۰,۰۰۰,۰۰۰', color: 'text-green-400' },
      { label: 'هزینه‌های جاری (تومان)', value: '۱۲۵,۰۰۰,۰۰۰', color: 'text-rose-400' },
      { label: 'پرسنل فعال', value: '۱۴۲', color: 'text-white/90' },
      { label: 'راندمان کلی شرکت', value: '٪۹۴', color: 'text-white/90' },
    ],
    chartLabel: 'روند جریان نقدی (Cash Flow) ۷ روز گذشته',
    chartData: [
      { name: 'شنبه', value: 400 }, { name: 'یکشنبه', value: 300 }, { name: 'دوشنبه', value: 550 },
      { name: 'سه‌شنبه', value: 450 }, { name: 'چهارشنبه', value: 700 }, { name: 'پنجشنبه', value: 650 }, { name: 'جمعه', value: 800 }
    ],
    listTitle: 'گزارشات کلان و هشدارها',
    listData: [
      { id: 1, title: 'افت ۵ درصدی حضور در بخش فروش', type: 'هشدار منابع انسانی', isAlert: true },
      { id: 2, title: 'بودجه مارکتینگ رو به اتمام است', type: 'هشدار مالی', isAlert: true },
    ],
    actionTitle: 'تصمیمات استراتژیک',
    actionData: [
      { id: 1, title: 'تایید استخدام مدیر ارشد فنی (CTO)', subtitle: 'دپارتمان مهندسی' },
      { id: 2, title: 'تخصیص بودجه پاداش فصلی', subtitle: 'مبلغ کل: ۲۰۰ میلیون تومان' },
    ]
  },

  // HR Manager Data
  hr: {
    kpis: [
      { label: 'پرسنل فعال', value: '۱۴۲', color: 'text-white/90' },
      { label: 'حاضرین امروز', value: '۱۳۸', color: 'text-green-400' },
      { label: 'غایبین امروز', value: '۴', color: 'text-rose-400' },
      { label: 'درخواست‌های باز', value: '۱۲', color: 'text-white/90' },
    ],
    chartLabel: 'روند حضور و غیاب ۷ روز گذشته',
    chartData: [
      { name: 'شنبه', value: 140 }, { name: 'یکشنبه', value: 142 }, { name: 'دوشنبه', value: 138 },
      { name: 'سه‌شنبه', value: 141 }, { name: 'چهارشنبه', value: 139 }, { name: 'پنجشنبه', value: 142 }, { name: 'جمعه', value: 142 }
    ],
    listTitle: 'وضعیت غایبین امروز',
    listData: [
      { id: 1, title: 'سارا احمدی', type: 'مرخصی استعلاجی', isAlert: false },
      { id: 2, title: 'علی حسینی', type: 'غیبت غیرموجه', isAlert: true },
    ],
    actionTitle: 'تاییدات فوری پرسنلی',
    actionData: [
      { id: 1, title: 'درخواست مرخصی شایان کریمی', subtitle: 'استحقاقی - ۲ روز' },
      { id: 2, title: 'تایید اضافه‌کار بخش پشتیبانی', subtitle: 'مجموعاً ۴۵ ساعت' },
    ]
  },

  // Finance Manager Data
  finance: {
    kpis: [
      { label: 'هزینه‌های ماه جاری (تومان)', value: '۱۲۵,۰۰۰,۰۰۰', color: 'text-rose-400' },
      { label: 'بودجه باقیمانده (تومان)', value: '۳۴۰,۰۰۰,۰۰۰', color: 'text-green-400' },
      { label: 'فیش‌های حقوقی در انتظار', value: '۴', color: 'text-white/90' },
      { label: 'اسناد پرداختی باز', value: '۱۸', color: 'text-white/90' },
    ],
    chartLabel: 'روند هزینه‌های ۷ روز گذشته (میلیون تومان)',
    chartData: [
      { name: 'شنبه', value: 12 }, { name: 'یکشنبه', value: 19 }, { name: 'دوشنبه', value: 15 },
      { name: 'سه‌شنبه', value: 25 }, { name: 'چهارشنبه', value: 22 }, { name: 'پنجشنبه', value: 30 }, { name: 'جمعه', value: 28 }
    ],
    listTitle: 'وضعیت اسناد و پرداخت‌ها',
    listData: [
      { id: 1, title: 'فاکتور خرید تجهیزات شبکه', type: 'سررسید شده', isAlert: true },
      { id: 2, title: 'مغایرت بانکی حساب اصلی', type: 'نیاز به بررسی', isAlert: true },
    ],
    actionTitle: 'تاییدات فوری مالی',
    actionData: [
      { id: 1, title: 'تایید فیش‌های حقوقی مرداد', subtitle: 'مجموع پرداختی: ۸۵ میلیون تومان' },
      { id: 2, title: 'درخواست شارژ تنخواه‌گردان', subtitle: 'بخش فنی - ۵ میلیون تومان' },
    ]
  },

  // Employee Data
  employee: {
    kpis: [
      { label: 'مرخصی باقیمانده', value: '۱۲ روز', color: 'text-white/90' },
      { label: 'مرخصی مصرفی این ماه', value: '۲ روز', color: 'text-white/90' },
      { label: 'ساعات اضافه‌کار ماه', value: '۱۴ ساعت', color: 'text-green-400' },
      { label: 'غیبت‌های ماه', value: '۰', color: 'text-white/90' },
    ],
    chartLabel: 'ساعات حضور شما در ۷ روز گذشته',
    chartData: [
      { name: 'شنبه', value: 8.5 }, { name: 'یکشنبه', value: 9 }, { name: 'دوشنبه', value: 8 },
      { name: 'سه‌شنبه', value: 8.5 }, { name: 'چهارشنبه', value: 10 }, { name: 'پنجشنبه', value: 4 }, { name: 'جمعه', value: 0 }
    ],
    listTitle: 'فیش‌های حقوقی اخیر',
    listData: [
      { id: 1, title: 'فیش حقوقی مرداد ۱۴۰۵', type: 'پرداخت شده', isAlert: false, isFile: true },
      { id: 2, title: 'فیش حقوقی تیر ۱۴۰۵', type: 'پرداخت شده', isAlert: false, isFile: true },
    ],
    actionTitle: 'پیگیری درخواست‌های من',
    actionData: [
      { id: 1, title: 'درخواست مساعده', subtitle: 'وضعیت: در انتظار تایید مالی', isPending: true },
      { id: 2, title: 'مرخصی استحقاقی (شهریور)', subtitle: 'وضعیت: تایید شده', isPending: false },
    ]
  }
};

// ==========================================
// CUSTOM CHART TOOLTIP
// ==========================================
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/[0.04] bg-[#1c1c1e]/80 p-3 shadow-2xl backdrop-blur-xl">
        <p className="mb-1 text-xs text-white/50">{label}</p>
        <p className="text-sm font-medium text-white/90">
          مقدار: <span className="font-semibold tracking-tight">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DashboardHome() {

  const userRole = 'Finance Manager'; 

  const roleData = 
    userRole === 'Admin' ? db.admin : 
    userRole === 'HR Manager' ? db.hr : 
    userRole === 'Finance Manager' ? db.finance : 
    db.employee;

  const [actions, setActions] = useState(roleData.actionData);

  const handleAction = (id) => {
    setActions(prev => prev.filter(action => action.id !== id));
  };

  return (
    <div className="w-full space-y-6 text-white" dir="rtl">
      
      {/* Header */}
      <div className="mb-8 flex flex-col items-start">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">
          نمای کلی داشبورد
        </h1>
        <p className="mt-1.5 text-sm text-white/40">
          {userRole === 'Employee' ? 'خلاصه وضعیت کارکرد و سوابق شما' : 'خلاصه وضعیت سیستم بر اساس دسترسی شما'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Card 1: KPIs */}
        <section className="flex flex-col justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="mb-6 text-sm font-medium text-white/70">
            {userRole === 'Employee' ? 'آمار کارکرد شما' : 'شاخص‌های کلیدی عملکرد'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {roleData.kpis.map((kpi, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-2xl bg-white/[0.02] p-5">
                <span className="text-xs text-white/40">{kpi.label}</span>
                <span className={`text-2xl font-semibold tracking-tight ${kpi.color}`}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Card 2: Chart */}
        <section className="flex h-80 flex-col rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="mb-6 text-sm font-medium text-white/70">
            {roleData.chartLabel}
          </h2>
          <div className="h-full w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roleData.chartData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Card 3: Lists */}
        <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="mb-6 text-sm font-medium text-white/70">{roleData.listTitle}</h2>
          
          {roleData.listData.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.02] bg-white/[0.01]">
              <CheckCircle className="text-green-400/50" size={24} />
              <p className="text-xs text-white/40">موردی برای نمایش وجود ندارد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {roleData.listData.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] ${item.isAlert ? 'text-rose-400' : 'text-white/70'}`}>
                      {item.isFile ? <FileText size={14} /> : item.isAlert ? <AlertCircle size={14} /> : item.title.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white/90">{item.title}</span>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                    item.isAlert ? 'bg-rose-500/10 text-rose-400' : 
                    item.isFile ? 'bg-green-500/10 text-green-400' : 'bg-[#f59e0b]/10 text-[#fbbf24]'
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Card 4: Actions */}
        <section className="rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="mb-6 text-sm font-medium text-white/70">{roleData.actionTitle}</h2>

          {actions.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-white/[0.02] bg-white/[0.01]">
              <p className="text-xs text-white/40">موردی یافت نشد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {actions.map((action) => (
                <div key={action.id} className="group flex items-center justify-between rounded-2xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white/90">{action.title}</span>
                    <span className="text-[11px] text-white/40">{action.subtitle}</span>
                  </div>
                  
                  {userRole === 'Employee' ? (
                    <div className="flex items-center gap-2">
                      {action.isPending ? (
                        <Clock size={16} className="text-[#fbbf24]/50" />
                      ) : (
                        <CheckCircle size={16} className="text-green-400/50" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                      <button 
                        onClick={() => handleAction(action.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-400 transition-colors hover:bg-green-500/20"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => handleAction(action.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}