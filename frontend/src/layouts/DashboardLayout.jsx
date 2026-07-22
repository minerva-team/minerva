import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Header from '../components/dashboard/Header'
import SplashScreen from '../components/SplashScreen'

export default function DashboardLayout() {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('minervaSplashSeen') !== 'true'
  })

  const handleSplashFinish = () => {
    sessionStorage.setItem('minervaSplashSeen', 'true')
    setShowSplash(false)
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className="flex h-screen overflow-hidden bg-[#141415]">
        <main className="flex min-w-0 flex-1 flex-col">
          <Header />
          
          <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8 scroll-smooth">
            <div className="mx-auto max-w-6xl pb-12">
              <Outlet />
            </div>
          </div>
        </main>

        <Sidebar />
      </div>
    </>
  )
}