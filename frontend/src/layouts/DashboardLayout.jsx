import { Outlet } from 'react-router-dom'

import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surfaceC">
      <main className="flex flex-1 flex-col">
        <Header />

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>

      <Sidebar />
    </div>
  )
}
