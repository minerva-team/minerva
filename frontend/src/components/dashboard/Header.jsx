import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-surfaceC px-8">
      <button className="rounded-xl p-2 transition hover:bg-white/5">
        <Bell size={22} className="text-matnC" />
      </button>

      <h1 className="text-2xl font-semibold text-matnC">داشبورد</h1>
    </header>
  )
}
