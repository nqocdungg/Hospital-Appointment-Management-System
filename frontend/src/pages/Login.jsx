import { useNavigate } from "react-router-dom"
import Authentication from "../components/Authentication"

export default function Login() {
  const navigate = useNavigate()

  return (
    <Authentication
      mode="login"
      onSuccess={() => {
        alert("Login successful!")
        navigate("/dashboard") 
      }}
    />
  )
}
