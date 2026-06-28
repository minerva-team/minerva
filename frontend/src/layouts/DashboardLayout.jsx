import { Outlet, Link } from "react-router-dom"

export default function DashboardLayout() {
  return (
    <div>
      <h1>Dashboard Layout</h1>

      <nav style={{ display: "flex", gap: "10px" }}>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/setting">Setting</Link>
      </nav>

      <hr />

      <Outlet />
    </div>
  )
}