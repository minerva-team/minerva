import { useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Wallet,
  Clock3,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react'

import SidebarItem from './SidebarItem'

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
    title: 'کارت دوم',
    to: '/dashboard/overtime',
    icon: Wallet,
  },
  {
    title: 'کارت سوم',
    to: '/dashboard/leave',
    icon: Calendar,
  },
]

const bottomMenuItems = [
  {
    title: 'تنظیمات',
    to: '/dashboard/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access')
    navigate('/login')
  }
  return (
    <aside className="flex h-screen w-72 flex-col justify-between border-l border-white/10 bg-backgroundC p-6">
      {/* بالا */}
      <div>
        <div className="mb-12 flex flex-row-reverse items-center justify-start gap-3 pr-4">
          <img
            src="/minervaLogo6-01.svg"
            alt="Minerva Logo"
            className="h-12 w-12 object-contain"
          />

          <h1 className="text-3xl font-bold text-white">مینروا</h1>
        </div>

        <nav className="space-y-3">
          {topMenuItems.map((item) => (
            <SidebarItem key={item.title} {...item} />
          ))}
        </nav>
      </div>

      {/* پایین */}
      <div className="space-y-3">
        {bottomMenuItems.map((item) => (
          <SidebarItem key={item.title} {...item} />
        ))}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-red-400 transition-all duration-200 hover:bg-red-500/20"
        >
          <span>خروج</span>
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}
