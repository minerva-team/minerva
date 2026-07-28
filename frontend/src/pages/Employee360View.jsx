import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Mail, Phone, Briefcase, Calendar, 
  Eye, EyeOff, ShieldAlert, FileText, Clock, Loader2,
  PieChart as PieIcon, Percent, AlertCircle, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ==========================================
// Mock Data 
// ==========================================
const MOCK_FALLBACK = {
  latestPayslip: {
    month: 'تیر ۱۴۰۲',
    netSalary: 1250000000,
    tax: 100000000,
    insurance: 100000000,
  },
  payrollConfig: {
    taxRate: '۱۰٪',
    insuranceRate: '۷٪',
    overtimeMultiplier: '۱.۴x',
    latenessMultiplier: '۱.۵x',
  }
};

const toPersianDate = (dateString) => {
  if (!dateString) return 'ثبت نشده';
  try {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// ==========================================
// Main Component
// ==========================================
export default function Employee360View() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'Employee';
  const isManager = userRole === 'HR Manager' || userRole === 'Admin';

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        const headers = { 'Authorization': `Bearer ${token}` };

        const res = await fetch(`http://localhost:8000/api/hr/employees/${id}/`, { headers });

        if (res.ok) {
          const data = await res.json();
          
          let financials = { baseSalary: 'نامشخص', contractType: 'نامشخص' };
          let attendanceTrend = [];
          
          if (isManager) {
            const metricsRes = await fetch(`http://localhost:8000/api/hr/employees/${id}/360-metrics/`, { headers });
            if (metricsRes.ok) {
              const metricsData = await metricsRes.json();
              financials = metricsData.financials;
              attendanceTrend = metricsData.attendanceTrend;
            }
          }

          setEmployeeData({
            id: data.employee_code || data.id,
            firstName: data.first_name || 'کارمند',
            lastName: data.last_name || 'بدون نام',
            jobTitle: data.job_title || 'سمت نامشخص',
            department: data.department_name || 'دپارتمان نامشخص',
            email: data.email || 'ثبت‌نشده',
            phone: data.phone_number || 'ثبت‌نشده',
            hireDate: toPersianDate(data.hire_date),
            avatar: data.profile_picture || null,
            status: Math.random() > 0.5 ? 'Present' : 'Absent',
            financials: financials, 
            attendanceTrend: attendanceTrend, 
            ...MOCK_FALLBACK 
          });
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id, isManager]);

  const CHART_PRIMARY = '#8b5cf6'; 
  const PAYSLIP_COLORS = ['#34d399', '#60a5fa', '#f43f5e'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const formatXAxis = (tickItem) => {
    const shortDays = {
      'شنبه': 'ش', 'یکشنبه': 'ی', 'دوشنبه': 'د', 
      'سه‌شنبه': 'س', 'چهارشنبه': 'چ', 'پنجشنبه': 'پ', 'جمعه': 'ج'
    };
    return shortDays[tickItem] || tickItem;
  };

  if (isLoading || !employeeData) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center rounded-[2rem] border border-white/[0.03] bg-[#0a0a0a]">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
      </div>
    );
  }

  const isPresent = employeeData.status === 'Present';
  const payslipChartData = [
    { name: 'خالص دریافتی', value: employeeData.latestPayslip.netSalary },
    { name: 'بیمه', value: employeeData.latestPayslip.insurance },
    { name: 'مالیات', value: employeeData.latestPayslip.tax },
  ];

  return (
    <div className="min-h-full w-full rounded-[2rem] border border-white/[0.03] bg-[#0a0a0a] p-8 text-white shadow-2xl" dir="rtl">
      
      {/* 1. Header Section */}
      <div className="mb-10 flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-lg">
            {employeeData.avatar ? (
              <img 
                src={employeeData.avatar} 
                alt={employeeData.firstName} 
                className="h-full w-full rounded-full object-cover p-1"
              />
            ) : (
              <span className="text-3xl font-light text-white/70">
                {employeeData.firstName.charAt(0)}{employeeData.lastName.charAt(0)}
              </span>
            )}
            <span 
              className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-[3px] border-[#0a0a0a] ${
                isPresent 
                  ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' 
                  : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight text-white/90">
              {employeeData.firstName} {employeeData.lastName}
            </h1>
            <p className="mt-1.5 text-sm text-white/50">{employeeData.jobTitle}</p>
            <div className="mt-3 flex w-max items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5">
              <span className="text-xs font-medium text-white/40">کد پرسنلی:</span>
              <span className="text-xs font-semibold text-white/70 tracking-wider">{employeeData.id}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#1c1c1e]/50 text-white/70 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:text-white hover:scale-105"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        
        {/* 2. Basic Info Card (Public) */}
        <motion.div variants={itemVariants} className="col-span-1 flex flex-col rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl h-full">
          <h2 className="text-sm font-bold text-white/80 tracking-wide mb-2">اطلاعات سازمانی</h2>
          
          <div className="flex flex-col flex-1 justify-center divide-y divide-white/[0.03]">
            
            <div className="flex items-center gap-4 text-white/70 py-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.02] transition-colors group-hover:bg-white/[0.06]">
                <Mail size={16} className="text-white/50" />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-[11px] text-white/40 font-medium">ایمیل سازمانی</span>
                <span className="text-sm tracking-wide truncate text-white/90">{employeeData.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70 py-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.02] transition-colors group-hover:bg-white/[0.06]">
                <Phone size={16} className="text-white/50" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-white/40 font-medium">موبایل</span>
                <span className="text-sm tracking-widest text-white/90 font-medium" dir="ltr">{employeeData.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70 py-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.02] transition-colors group-hover:bg-white/[0.06]">
                <Briefcase size={16} className="text-white/50" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-white/40 font-medium">دپارتمان</span>
                <span className="text-sm text-white/90">{employeeData.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70 py-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.02] transition-colors group-hover:bg-white/[0.06]">
                <Calendar size={16} className="text-white/50" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-white/40 font-medium">تاریخ استخدام</span>
                <span className="text-sm text-white/90">{employeeData.hireDate}</span>
              </div>
            </div>
            
          </div>
        </motion.div>

        {/* 3. Manager Only Dashboard Section */}
        {isManager ? (
          <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <motion.div variants={itemVariants} className="flex flex-col rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white/80 tracking-wide">روند ساعات کاری</h2>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/50">۷ روز گذشته</span>
                </div>
                <div className="h-40 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={employeeData.attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="day" axisLine={false} tickLine={false} tickFormatter={formatXAxis}
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'inherit' }} dy={10} 
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'right', direction: 'rtl', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                          itemStyle={{ color: '#fff', fontSize: '13px' }}
                        />
                        <Area type="monotone" dataKey="hours" stroke={CHART_PRIMARY} strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-white/80 tracking-wide">
                    <ShieldAlert size={16} className="text-white/40" />
                    جزئیات مالی و قرارداد
                  </h2>
                  <button 
                    onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                    className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/[0.1] hover:text-white"
                  >
                    {isSalaryVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <div className="mt-6 flex flex-col gap-6 relative z-10">
                  <div>
                    <span className="text-[11px] font-medium text-white/40">حقوق پایه</span>
                    <div className="mt-1 flex items-end gap-2">
                      <span className={`text-4xl font-bold tracking-tight text-white transition-all duration-500 ${isSalaryVisible ? 'blur-none opacity-100' : 'blur-xl opacity-40 select-none'}`}>
                        {employeeData.financials?.baseSalary || 'نامشخص'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.02] bg-white/[0.02] p-4 backdrop-blur-sm">
                    <FileText size={20} className="text-white/40" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">نوع قرارداد</span>
                      <span className="text-sm font-medium text-white/80">{employeeData.financials?.contractType || 'نامشخص'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Apple-Style Donut Chart */}
              <div className="flex items-center justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl h-full">
                <div className="flex flex-col gap-6 z-10 w-[55%]">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-bold text-white/90 tracking-wide">آنالیز فیش حقوقی</h3>
                    <span className="text-[10px] font-medium text-white/50 bg-white/[0.05] w-max px-2.5 py-1 rounded-md">{employeeData.latestPayslip.month}</span>
                  </div>
                  
                  <div className={`flex flex-col gap-4 transition-all duration-500 ${isSalaryVisible ? 'blur-none opacity-100' : 'blur-md opacity-40 select-none'}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-[11px] font-medium text-white/60">خالص</span>
                      </div>
                      <span className="text-xs font-bold text-white/90">{employeeData.latestPayslip.netSalary.toLocaleString('fa-IR')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                        <span className="text-[11px] font-medium text-white/60">بیمه</span>
                      </div>
                      <span className="text-xs font-bold text-white/90">{employeeData.latestPayslip.insurance.toLocaleString('fa-IR')}</span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[11px] font-medium text-white/60">مالیات</span>
                      </div>
                      <span className="text-xs font-bold text-white/90">{employeeData.latestPayslip.tax.toLocaleString('fa-IR')}</span>
                    </div>
                  </div>
                </div>

                <div className={`relative h-36 w-36 transition-all duration-500 ${isSalaryVisible ? 'blur-none opacity-100' : 'blur-xl opacity-30 select-none'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={payslipChartData}
                        innerRadius={50} 
                        outerRadius={65}
                        paddingAngle={6} 
                        cornerRadius={8} 
                        dataKey="value"
                        stroke="none"
                      >
                        {payslipChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PAYSLIP_COLORS[index % PAYSLIP_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <PieIcon size={20} className="text-white/20 mb-1" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Payroll Configs */}
              <div className="flex flex-col justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl h-full">
                <div className="flex flex-col gap-1.5 mb-5">
                  <h3 className="text-sm font-bold text-white/90 tracking-wide">قوانین حقوق و دستمزد</h3>
                  <span className="text-[10px] text-white/50">تنظیمات پایه محاسبه</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.02] p-3.5 border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                        <TrendingUp size={16} />
                      </div>
                      <span className="text-xs font-medium text-white/60">ضریب اضافه‌کاری</span>
                    </div>
                    <span className="text-sm font-bold text-white/90">{employeeData.payrollConfig.overtimeMultiplier}</span>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.02] p-3.5 border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                        <AlertCircle size={16} />
                      </div>
                      <span className="text-xs font-medium text-white/60">ضریب کسر کار</span>
                    </div>
                    <span className="text-sm font-bold text-white/90">{employeeData.payrollConfig.latenessMultiplier}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/[0.02] p-3.5 border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <Percent size={16} />
                      </div>
                      <span className="text-xs font-medium text-white/60">نرخ بیمه</span>
                    </div>
                    <span className="text-sm font-bold text-white/90">{employeeData.payrollConfig.insuranceRate}</span>
                  </div>
                  
                </div>
              </div>

            </motion.div>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col items-center justify-center rounded-3xl border border-white/[0.02] bg-[#1c1c1e]/10 p-6 backdrop-blur-sm lg:col-span-2">
            <Clock size={48} className="mb-4 text-white/10" />
            <p className="text-sm text-white/40">جزئیات مالی و شاخص‌های عملکرد منحصراً برای مدیریت قابل دسترسی است.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}