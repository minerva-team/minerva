import { NavLink } from 'react-router-dom'

export default function SidebarItem({ to, icon: Icon, title, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 ${
          isActive
            ? 'bg-primaryC text-matnC'
            : 'text-matnC hover:bg-primaryC/20'
        }`
      }
    >
      <span className="text-base font-medium">{title}</span>

      <Icon size={20} />
    </NavLink>
  )
}
