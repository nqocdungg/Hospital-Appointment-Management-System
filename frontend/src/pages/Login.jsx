
import { useNavigate } from "react-router-dom"
import Authentication from "../components/Authentication"

export default function Login() {
  const navigate = useNavigate()

  return (
    <Authentication
      mode="login"
      onSuccess={() => {
        const role = localStorage.getItem("role")?.toLowerCase()
        alert("Login successful!")

        if (role === "admin") navigate("/admin/dashboard")
        else if (role === "doctor") navigate("/doctor/dashboard")
        else if (role === "patient") navigate("/patient/home")
        else navigate("/") 
      }}
    />
  )
}
