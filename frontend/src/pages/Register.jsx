import { useNavigate } from "react-router-dom"
import Authentication from "../components/Authentication"

export default function Register() {
  const navigate = useNavigate()

  return (
    <Authentication
      mode="register"
      onSuccess={() => {
        alert("Register successful!")
        navigate("/login")
      }}
    />
  )
}
