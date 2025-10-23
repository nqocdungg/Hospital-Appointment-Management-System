import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../index.css"
import axios from "axios"

export default function Authentication({ mode = "login", onSuccess }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(mode === "login")
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    dob: "",
    gender: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLogin(mode === "login")
    setForm({
      fullname: "",
      email: "",
      password: "",
      confirm: "",
      phone: "",
      dob: "",
      gender: "",
    })
    setError(null)
  }, [mode])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (loading) return

    try {
      setLoading(true)
      if (isLogin) {
        const res = await axios.post("http://localhost:5050/api/auth/login", {
          email: form.email,
          password: form.password,
        })

        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.role)

        if (res.data.role === "patient") {
          localStorage.setItem("patient", JSON.stringify(res.data.user))
        } else {
          localStorage.setItem("user", JSON.stringify(res.data.user))
        }

        onSuccess?.()
      } else {
        if (form.password !== form.confirm) {
          setError("Passwords do not match")
          return
        }

        const res = await axios.post("http://localhost:5050/api/auth/register", {
          fullname: form.fullname,
          email: form.email,
          password: form.password,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
        })

        alert(res.data.message || "Registration successful!")
        navigate("/login")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <div className="auth-header">
          <h1>HAMS PROJECT</h1>
          <p>Hospital Appointment Management System</p>
        </div>

        <div className={`auth-box ${isLogin ? "small" : "large"}`}>
          <h2 className="log-in-text">{isLogin ? "LOGIN" : "REGISTER"}</h2>

          <form key={isLogin ? "login-form" : "register-form"} onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    name="fullname"
                    placeholder="Fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    required
                    autoComplete="new-name"
                  />
                </div>
                <div className="form-group">
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="new-phone"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete={isLogin ? "username" : "new-email"}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Confirm password"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group gender-group">
                  <div className="gender-options">
                    <label><input type="radio" name="gender" value="M" onChange={handleChange} required /> Male</label>
                    <label><input type="radio" name="gender" value="F" onChange={handleChange} required /> Female</label>
                    <label><input type="radio" name="gender" value="O" onChange={handleChange} required /> Other</label>
                  </div>
                </div>
              </>
            )}

            {error && <p className="error">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              className="switch-link"
              onClick={() => {
                setIsLogin(!isLogin)
                if (isLogin) navigate("/register", { replace: true })
                else navigate("/login", { replace: true })
              }}
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>

          <hr className="divider-inside" />
        </div>
      </div>
    </div>
  )
}
