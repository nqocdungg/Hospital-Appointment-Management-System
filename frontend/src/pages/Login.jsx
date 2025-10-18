import { useNavigate } from "react-router-dom"
import Authentication from "../components/Authentication"

export default function Login() {
  const navigate = useNavigate()

  return (
    <Authentication
      mode="login"
      onSuccess={() => {
        const role = localStorage.getItem("role")
        alert("Login successful!")
        if (role == "ADMIN") navigate("/admin/dashboard") 
        else if (role == "DOCTOR") navigate("/doctor/dashboard")
        else navigate("/patient/dashboard")
      }}
    />
  )
}
