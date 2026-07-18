import { Outlet } from 'react-router-dom'

import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surfaceC">
      <main className="flex min-w-0 flex-1 flex-col">
        <Header />

        <div className="min-h-0 flex-1 overflow-hidden p-8">
          <Outlet />
        </div>
      </main>

      <Sidebar />
    </div>
  )
}
