import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../pages/Login'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardHome from '../pages/DashboardHome'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import AttendanceLeave from '@/pages/AttendanceLeave'
import OrganizationChart from '@/pages/OrganizationChart'
import ProtectedRoute from './ProtectedRoute'
import HrLeaveManagement from '../pages/HrLeaveManagement' 
import Employee360View from '@/pages/Employee360View' 

const RequireRole = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem('userRole') || 'Employee'
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

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
          <Route path="profile" element={<Profile />} />
          
          <Route path="employee/:id" element={<Employee360View />} />
          
          <Route 
            path="org-chart" 
            element={
              <RequireRole allowedRoles={['HR Manager', 'Admin']}>
                <OrganizationChart />
              </RequireRole>
            } 
          />
          
          <Route 
            path="hr-leaves" 
            element={
              <RequireRole allowedRoles={['HR Manager', 'Admin']}>
                <HrLeaveManagement />
              </RequireRole>
            } 
          />

        </Route>
      </Route>

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}