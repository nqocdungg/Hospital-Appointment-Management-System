import { useEffect, useState } from "react"
import "../index.css"
import axios from "axios"

export default function Authentication({ mode = "login", onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullname, setFullname] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLogin(mode === "login")
  }, [mode])
  async function handleAuthenticate(e) {
    e.preventDefault()
    if (!email || !email.includes("@") || !password || password.length < 6 || isAuthenticating) return
    try {
      setIsAuthenticating(true)
      setError(null)
      if (isLogin) await login(email, password)
      else await signup(email, password)
      onSuccess?.()
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || err.message || "Something went wrong!")
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function login(email, password) {
    const res = await axios.post("http://localhost:5050/api/auth/login", { email, password })
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("role", res.data.role)
    localStorage.setItem("fullname", res.data.fullname)
  }

  async function signup(email, password) {
    const res = await axios.post("http://localhost:5050/api/auth/register", {
      fullname,
      email,
      password,
      phone,
      dob,
      gender,
    })
    alert(res.data.message)
  }

  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <div className="auth-header">
          <h1>HAMS PROJECT</h1>
          <p>Hospital Appointment Management System</p>
        </div>
        <div className="auth-box">
          <h2 className="log-in-text">{isLogin ? "LOGIN" : "REGISTER"}</h2>
          <form onSubmit={handleAuthenticate}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input type="text" name="fullname" placeholder="Fullname" onChange={e => setFullname(e.target.value)} required />
                </div>
                <div className="form-group">
                  <input type="text" name="phone" placeholder="Phone" onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <input type="date" name="dob" onChange={e => setDob(e.target.value)} required />
                </div>
              </>
            )}
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group"> <input type="password" name="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /> </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input type="password" name="confirm" placeholder="Confirm password" required />
                </div>
                <div className="form-group gender-group">
                  <div className="gender-options">
                    <label>
                      <input type="radio" name="gender" value="M" onChange={e => setGender(e.target.value)} required /> Male
                    </label>
                    <label>
                      <input type="radio" name="gender" value="F" onChange={e => setGender(e.target.value)} required /> Female
                    </label>
                    <label>
                      <input type="radio" name="gender" value="O" onChange={e => setGender(e.target.value)} required /> Other
                    </label>
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="auth-btn" disabled={isAuthenticating}>
              {isAuthenticating ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span className="switch-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register" : "Login"}
            </span>
          </p>      
          <hr className="divider-inside" />
        </div>
      </div>
    </div>
  )
}
