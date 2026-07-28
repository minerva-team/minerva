import { useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Clock3, Calendar, CalendarCheck, Network, LogOut, User } from 'lucide-react'

import SidebarItem from './SidebarItem'
import UserAvatar from '../ui/UserAvatar'
const topMenuItems = [
  {
    title: 'داشبورد',
    to: '/dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    title: 'ثبت حضور و مرخصی',
    to: '/dashboard/attendance',
    icon: Clock3,
  },
  {
    title: 'مدیریت مرخصی‌ها',
    to: '/dashboard/hr-leaves',
    icon: CalendarCheck,
    roles: ['HR Manager', 'Admin'], 
  },
  {
  title: 'ساختار سازمانی',
  to: '/dashboard/org-chart',
  icon: Network,
  roles: ['Admin', 'HR Manager'], 
},
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access')
    navigate('/login')
  }
  
  const userRole = localStorage.getItem('userRole') || 'Employee'

  const visibleTopMenuItems = topMenuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className="flex h-screen w-72 flex-col justify-between border-l border-white/[0.04] bg-[#0a0a0a] p-5">
      
      <div>
        <div className="mb-10 mt-2 flex items-center justify-start gap-3 px-3">
          <img
            src="/minervaLogo6-01.svg"
            alt="Minerva Logo"
            className="h-9 w-9 object-contain opacity-90"
          />
          <h1 className="text-2xl font-medium tracking-tight text-white/90">مینروا</h1>
        </div>

        <nav className="space-y-1">
          {visibleTopMenuItems.map((item) => (
            <SidebarItem key={item.title} {...item} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 pt-4 border-t border-white/[0.04]">
        
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 transition-all duration-300 ${
              isActive 
                ? 'bg-white/10 text-white' 
                : 'text-white/50 hover:bg-white/[0.03] hover:text-white/90'
            }`
          }
        >
          <UserAvatar />
          <span className="text-sm font-medium tracking-wide">پروفایل من</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-white/50 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <div className="flex h-8 w-8 items-center justify-center shrink-0">
            <LogOut size={19} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <span className="text-sm font-medium tracking-wide">خروج از حساب</span>
        </button>
        
      </div>
    </aside>
  )
}