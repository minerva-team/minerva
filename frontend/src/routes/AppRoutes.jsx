import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHome from '../pages/DashboardHome'
import Setting from '../pages/Settings'
import Salary from '../pages/Salary'
import NotFound from '../pages/NotFound'

import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* public route */}
      <Route path="/login" element={<Login />} />

      {/* protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="attendance" element={<AttendanceLeave />} />
          <Route path="settings" element={<Setting />} />
          <Route path="salary" element={<Salary />} />
        </Route>
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
