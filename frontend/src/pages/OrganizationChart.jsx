import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, User, Briefcase, Clock, Search, Loader2 } from 'lucide-react';
// ==========================================
// Sub-components for modularity
// ==========================================

const Tooltip = ({ employee }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute bottom-full left-1/2 mb-4 w-48 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#1c1c1e]/95 p-3 shadow-2xl backdrop-blur-xl"
  >
    <div className="flex flex-col items-center text-center">
      <span className="text-sm font-semibold text-white">
        {employee.first_name} {employee.last_name}
      </span>
      <span className="mt-1 text-xs text-white/60">{employee.job_title}</span>
      <div className="mt-2 flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1">
        <Clock size={12} className={employee.status === 'Present' ? 'text-green-400' : 'text-red-400'} />
        <span className="text-[10px] text-white/80">
          {employee.status === 'Present' ? 'حاضر' : 'غایب / مرخصی'}
        </span>
      </div>
    </div>
  </motion.div>
);

const EmployeeBubble = ({ employee }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const isPresent = employee.status === 'Present';

  return (
    <div
      className={`relative flex items-center justify-center ${isHovered ? 'z-50' : 'z-10'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>{isHovered && <Tooltip employee={employee} />}</AnimatePresence>

      <motion.button
        onClick={() => navigate(`/dashboard/employee/${employee.id}`)}
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.03] shadow-lg backdrop-blur-md transition-colors hover:border-white/[0.15] hover:bg-white/[0.08]"
      >
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.first_name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-lg font-medium text-white/70">
            {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
          </span>
        )}

        {/* Status Indicator Dot with Glow */}
        <span 
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#151516] ${
            isPresent 
              ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' 
              : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
          }`}
        />
      </motion.button>
    </div>
  );
};

const DepartmentCluster = ({ department }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="mb-4 flex items-center gap-2 rounded-full border border-white/[0.03] bg-white/[0.02] px-5 py-2 backdrop-blur-sm">
        <Briefcase size={16} className="text-white/40" />
        <h3 className="text-sm font-medium text-white/80">{department.name}</h3>
        <span className="ml-2 rounded-full bg-white/[0.05] px-2 py-0.5 text-xs text-white/50">
          {department.employees.length} نفر
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-6 rounded-[3rem] border border-white/[0.04] bg-[#1c1c1e]/30 p-10 shadow-lg backdrop-blur-xl md:max-w-2xl relative z-0">
        {department.employees.map((emp) => (
          <EmployeeBubble key={emp.id} employee={emp} />
        ))}
      </div>
    </motion.div>
  );
};

// ==========================================
// Main Page Component
// ==========================================

export default function OrganizationChart() {
  const [viewMode, setViewMode] = useState('bubble'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [deptRes, empRes, attRes] = await Promise.all([
          fetch('http://localhost:8000/api/hr/departments/', { headers }),
          fetch('http://localhost:8000/api/hr/employees/', { headers }),
          fetch('http://localhost:8000/api/hr/attendance/', { headers })
        ]);

        if (deptRes.ok && empRes.ok && attRes.ok) {
          const deptData = await deptRes.json();
          const empData = await empRes.json();
          const attData = await attRes.json();

          const departmentsList = deptData.results || deptData;
          const employeesList = empData.results || empData;
          const attendanceList = attData.results || attData;

          const today = new Date().toISOString().split('T')[0];

          const attendanceMap = {};
          attendanceList.forEach(record => {
            if (record.date === today) {
              attendanceMap[record.employee] = record.status;
            }
          });

          const groupedData = departmentsList.map(dept => {
            return {
              id: dept.id,
              name: dept.name,
              employees: employeesList
                .filter(emp => emp.department === dept.id)
                .map(emp => ({
                  id: emp.id,
                  first_name: emp.first_name || (emp.email ? emp.email.split('@')[0] : 'کارمند'),
                  last_name: emp.last_name || '',
                  job_title: emp.job_title || 'نامشخص',
                  avatar: emp.profile_picture || null,
                  status: attendanceMap[emp.id] || 'Absent' 
                }))
            };
          });

          setDepartments(groupedData);
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  const filteredDepartments = departments.map(dept => ({
    ...dept,
    employees: dept.employees.filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(dept => dept.employees.length > 0);

  return (
    <div className="min-h-full w-full rounded-[2rem] border border-white/[0.03] bg-[#0a0a0a] p-8 text-white shadow-2xl" dir="rtl">
      
      {/* Header & Controls */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">ساختار سازمانی</h1>
          <p className="mt-1 text-sm text-white/50">نمای کلی دپارتمان‌ها و پرسنل سیستم مینروا</p>
        </div>

        <div className="flex w-full flex-col-reverse gap-4 md:w-auto md:flex-row md:items-center">
          
          <div className="relative flex items-center w-full md:w-64">
            <Search size={18} className="absolute right-3 text-white/40" />
            <input 
              type="text" 
              placeholder="جستجوی پرسنل یا سمت..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pr-10 pl-4 text-sm text-white placeholder-white/40 outline-none backdrop-blur-lg transition-all hover:bg-white/[0.06] focus:border-white/20 focus:bg-white/[0.08] focus:ring-1 focus:ring-white/10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-white/[0.05] bg-[#1c1c1e]/50 p-1 backdrop-blur-lg">
            <button
              onClick={() => setViewMode('bubble')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                viewMode === 'bubble' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">نمای حبابی</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                viewMode === 'list' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <List size={16} />
              <span className="hidden sm:inline">نمای لیستی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/20" />
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="flex h-64 w-full flex-col items-center justify-center text-white/40">
          <Search size={48} className="mb-4 opacity-20" />
          <p>هیچ کارمندی با این مشخصات یافت نشد.</p>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === 'bubble' ? (
            <div className="flex flex-col items-center justify-center gap-16 py-10">
              {filteredDepartments.map((dept) => (
                <DepartmentCluster key={dept.id} department={dept} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-8"
            >
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="rounded-2xl border border-white/[0.04] bg-[#1c1c1e]/30 p-6 backdrop-blur-xl">
                  <h3 className="mb-6 text-lg font-medium text-white/90">{dept.name}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dept.employees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => navigate(`/dashboard/employee/${emp.id}`)}
                        className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.02] bg-white/[0.02] p-4 transition-all hover:border-white/[0.05] hover:bg-white/[0.06]"
                      >
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/70 transition-transform group-hover:scale-105">
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.first_name} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                          <span 
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#1e1e20] ${
                              emp.status === 'Present' 
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' 
                                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                            }`}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium text-white transition-colors group-hover:text-white">
                            {emp.first_name} {emp.last_name}
                          </span>
                          <span className="truncate text-xs text-white/50">{emp.job_title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}