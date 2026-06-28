import { Navigate, useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()

  const token = localStorage.getItem("access")

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = () => {
    localStorage.setItem("access", "fake-token")
    navigate("/dashboard")
  }

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}