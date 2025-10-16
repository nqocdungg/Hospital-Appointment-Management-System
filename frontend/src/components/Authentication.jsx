import { useState } from "react"
import "../index.css"

export default function Authentication({ mode = "login", onSuccess }) {
  const isLogin = mode === "login"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState(null)

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
      setError(err.message || "Something went wrong!")
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function login(email, password) {
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  async function signup(email, password) {
    return new Promise(resolve => setTimeout(resolve, 1000))
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
                  <input type="text" name="fullname" placeholder="Fullname" required />
                </div>
                <div className="form-group">
                  <input type="text" name="phone" placeholder="Phone" required />
                </div>
                <div className="form-group">
                  <input type="date" name="dob" required />
                </div>
              </>
            )}
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="password" name="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input type="password" name="confirm" placeholder="Confirm password" required />
                </div>
                <div className="form-group gender-group">
                  <div className="gender-options">
                    <label>
                      <input type="radio" name="gender" value="Male" required /> Male
                    </label>
                    <label>
                      <input type="radio" name="gender" value="Female" required /> Female
                    </label>
                    <label>
                      <input type="radio" name="gender" value="Other" required /> Other
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
          <hr className="divider-inside" />
        </div>
      </div>
    </div>
  )
}
