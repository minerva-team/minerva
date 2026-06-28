import { Outlet, Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard Layout</h1>

      <nav>
        <Link to="">Home</Link> |{" "}
        <Link to="settings">Settings</Link>
      </nav>

      <hr />

      <Outlet />
    </div>
  )
}