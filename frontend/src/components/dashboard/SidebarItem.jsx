import { NavLink } from 'react-router-dom'

export default function SidebarItem({ to, icon: Icon, title }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between rounded-2xl px-4 py-4 transition-colors duration-200
        ${
          isActive
            ? 'bg-primaryC text-matnC'
            : 'text-matnC hover:bg-primaryC/40'
        }`
      }
    >
      <span className="text-base font-medium">{title}</span>

      <Icon size={20} />
    </NavLink>
  )
}
