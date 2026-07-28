import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  FileText,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// ==========================================
// Mock Data (Persian & RTL)
// ==========================================
const MOCK_EMPLOYEE = {
  id: 'MNV-0001',
  firstName: 'شاهین',
  lastName: 'زمانی',
  jobTitle: 'مدیرعامل (CEO)',
  department: 'تیم رهبری مینروا',
  email: 'shahinzam1402@gmail.com',
  phone: '۰۹۰۳ ۰۰۰ ۰۰۰۰',
  hireDate: '۱۴۰۲/۰۳/۱۵',
  status: 'Present',
  avatar: null, 
  financials: {
    baseSalary: '۱,۴۵۰,۰۰۰,۰۰۰ تومان',
    contractType: 'دائم / تمام‌وقت',
  },
  attendanceTrend: [
    { day: 'شنبه', hours: 8.5 },
    { day: 'یکشنبه', hours: 7.8 },
    { day: 'دوشنبه', hours: 9.1 },
    { day: 'سه‌شنبه', hours: 8.0 },
    { day: 'چهارشنبه', hours: 8.2 },
    { day: 'پنجشنبه', hours: 4.0 },
    { day: 'جمعه', hours: 0 },
  ],
  leaves: {
    annual: { used: 4, total: 26 },
    sick: { used: 1, total: 10 }
  }
};

// ==========================================
// Main Component
// ==========================================
export default function Employee360View() {
  const navigate = useNavigate();
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);

  // Role-Based Access Control (RBAC) - فرض بر این است که مدیرعامل نقش Admin دارد
  const userRole = localStorage.getItem('userRole') || 'Admin';
  const isManager = userRole === 'HR Manager' || userRole === 'Admin';

  const isPresent = MOCK_EMPLOYEE.status === 'Present';

  // Chart Colors
  const CHART_PRIMARY = '#8b5cf6'; // Violet
  const PIE_COLORS = ['#8b5cf6', 'rgba(255,255,255,0.05)'];
  const SICK_PIE_COLORS = ['#ef4444', 'rgba(255,255,255,0.05)'];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const formatXAxis = (tickItem) => {
    const shortDays = {
      'شنبه': 'ش',
      'یکشنبه': 'ی',
      'دوشنبه': 'د',
      'سه‌شنبه': 'س',
      'چهارشنبه': 'چ',
      'پنجشنبه': 'پ',
      'جمعه': 'ج'
    };
    return shortDays[tickItem] || tickItem;
  };
  return (
    <div className="min-h-full w-full rounded-[2rem] border border-white/[0.03] bg-[#0a0a0a] p-8 text-white shadow-2xl" dir="rtl">
      
      {/* 1. Header Section */}
      <div className="mb-10 flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Avatar with Status */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            {MOCK_EMPLOYEE.avatar ? (
              <img 
                src={MOCK_EMPLOYEE.avatar} 
                alt={MOCK_EMPLOYEE.firstName} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-light text-white/70">
                {MOCK_EMPLOYEE.firstName.charAt(0)}{MOCK_EMPLOYEE.lastName.charAt(0)}
              </span>
            )}
            
            {/* Glowing Status Dot */}
            <span 
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#0a0a0a] ${
                isPresent 
                  ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' 
                  : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {MOCK_EMPLOYEE.firstName} {MOCK_EMPLOYEE.lastName}
            </h1>
            <p className="mt-1 text-lg text-white/50">{MOCK_EMPLOYEE.jobTitle}</p>
            <div className="mt-3 flex w-max items-center gap-2 rounded-full border border-white/[0.02] bg-white/[0.04] px-3 py-1">
              <span className="text-xs font-medium text-white/60">کد پرسنلی: {MOCK_EMPLOYEE.id}</span>
            </div>
          </div>
        </div>

        {/* Minimalist Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#1c1c1e]/50 text-white/70 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:text-white"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        
        {/* 2. Basic Info Card (Public) */}
        <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-6 rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium text-white/90">اطلاعات تماس و سازمانی</h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 text-white/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Mail size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40">آدرس ایمیل</span>
                <span className="text-sm">{MOCK_EMPLOYEE.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Phone size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40">شماره موبایل</span>
                <span className="text-sm" dir="ltr">{MOCK_EMPLOYEE.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Briefcase size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40">دپارتمان</span>
                <span className="text-sm">{MOCK_EMPLOYEE.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40">تاریخ استخدام</span>
                <span className="text-sm">{MOCK_EMPLOYEE.hireDate}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Manager Only Dashboard Section */}
        {isManager ? (
          <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
            
            {/* Top Row: Attendance Chart & Financials */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Attendance Area Chart */}
              <motion.div variants={itemVariants} className="flex flex-col rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white/90">روند ساعات کاری</h2>
                  <span className="text-xs text-white/40">۷ روز گذشته</span>
                </div>
                <div className="h-40 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_EMPLOYEE.attendanceTrend} margin={{ top: 10, right: 0, left: -20, bottom: 10 }}>
                        <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        
                        <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={formatXAxis}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'inherit', fontWeight: 500 }} 
                        dy={5} 
                        />
                        
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} />
                        <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', backdropFilter: 'blur(10px)', textAlign: 'right', direction: 'rtl' }}
                        itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="hours" stroke={CHART_PRIMARY} strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Financial & Contract Info (Privacy Feature) */}
              <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-medium text-white/90">
                    <ShieldAlert size={18} className="text-white/40" />
                    جزئیات مالی و قرارداد
                  </h2>
                  <button 
                    onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                    className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {isSalaryVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                <div className="mt-4 flex flex-col gap-6">
                  <div>
                    <span className="text-xs text-white/40">حقوق پایه (سالیانه)</span>
                    <div className="mt-1 flex items-end gap-2">
                      <span className={`text-3xl font-bold tracking-tight text-white transition-all duration-300 ${isSalaryVisible ? 'blur-none opacity-100' : 'blur-md opacity-40'}`}>
                        {MOCK_EMPLOYEE.financials.baseSalary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.02] bg-white/[0.02] p-4">
                    <FileText size={20} className="text-white/50" />
                    <div className="flex flex-col">
                      <span className="text-xs text-white/40">نوع قرارداد</span>
                      <span className="text-sm font-medium text-white/80">{MOCK_EMPLOYEE.financials.contractType}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Bottom Row: Leave Balances */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Annual Leave Donut */}
              <div className="flex items-center justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-white/90">مرخصی استحقاقی</h3>
                  <span className="text-2xl font-bold text-white">{MOCK_EMPLOYEE.leaves.annual.total - MOCK_EMPLOYEE.leaves.annual.used} <span className="text-sm font-normal text-white/40">روز باقیمانده</span></span>
                  <span className="mt-2 text-xs text-white/40">{MOCK_EMPLOYEE.leaves.annual.used} روز استفاده شده از {MOCK_EMPLOYEE.leaves.annual.total} روز</span>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: MOCK_EMPLOYEE.leaves.annual.used },
                          { value: MOCK_EMPLOYEE.leaves.annual.total - MOCK_EMPLOYEE.leaves.annual.used }
                        ]}
                        innerRadius={30}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sick Leave Donut */}
              <div className="flex items-center justify-between rounded-3xl border border-white/[0.04] bg-[#1c1c1e]/40 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-white/90">مرخصی استعلاجی</h3>
                  <span className="text-2xl font-bold text-white">{MOCK_EMPLOYEE.leaves.sick.total - MOCK_EMPLOYEE.leaves.sick.used} <span className="text-sm font-normal text-white/40">روز باقیمانده</span></span>
                  <span className="mt-2 text-xs text-white/40">{MOCK_EMPLOYEE.leaves.sick.used} روز استفاده شده از {MOCK_EMPLOYEE.leaves.sick.total} روز</span>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: MOCK_EMPLOYEE.leaves.sick.used },
                          { value: MOCK_EMPLOYEE.leaves.sick.total - MOCK_EMPLOYEE.leaves.sick.used }
                        ]}
                        innerRadius={30}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {SICK_PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </motion.div>
          </div>
        ) : (
          /* Empty state for non-managers */
          <motion.div variants={itemVariants} className="col-span-1 flex flex-col items-center justify-center rounded-3xl border border-white/[0.02] bg-[#1c1c1e]/10 p-6 backdrop-blur-sm lg:col-span-2">
            <Clock size={48} className="mb-4 text-white/10" />
            <p className="text-sm text-white/40">جزئیات مالی و شاخص‌های عملکرد منحصراً برای مدیریت قابل دسترسی است.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}