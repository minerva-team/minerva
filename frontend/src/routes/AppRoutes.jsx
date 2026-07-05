import { Routes, Route } from "react-router-dom"

import Login from "../pages/Login"
import DashboardLayout from "../layouts/DashboardLayout"
import DashboardHome from "../pages/DashboardHome"
import Setting from "../pages/Settings"

import ProtectedRoute from "./ProtectedRoute"

export default function AppRoutes() {
  return (
    <Routes>
      {/* public route */}
      <Route path="/login" element={<Login />} />

      {/* protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Route>
      
       {/* 404 page */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}