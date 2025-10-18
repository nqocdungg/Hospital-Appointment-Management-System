import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function PatientForm({ mode = "add" }) {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token")
  const API_URL = "http://localhost:5050/api"
  const isEdit = mode === "edit"

  useEffect(() => {
    if (isEdit && id) {
      axios
        .get(`${API_URL}/admin/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const p = res.data
          setForm({
            fullname: p.user.fullname || "",
            email: p.user.email || "",
            gender: p.gender || "",
            dob: p.dob ? p.dob.slice(0, 10) : "",
            phone: p.user.phone || "",
            address: p.address || "",
            password: "",
          })
        })
        .catch((err) => console.error("Error fetching patient:", err))
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit)
        await axios.put(`${API_URL}/admin/patients/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
      else
        await axios.post(`${API_URL}/admin/patients`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })

      alert(isEdit ? "Patient updated successfully!" : "Patient added successfully!")
      navigate("/admin/patients")
    } catch (err) {
      console.error("Error saving patient:", err)
      alert("Failed to save patient.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">
              <FaArrowLeft className="back-icon" onClick={() => navigate("/admin/patients")} />
              {isEdit ? "Edit Patient" : "Add Patient"}
            </h2>
          </div>

          <div className="doctor-form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {!isEdit && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0901234567"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 123 Nguyen Trai, Hanoi"
                />
              </div>

              <div className="form-group gender-group">
                <label>Gender</label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={form.gender === "M"}
                    onChange={handleChange}
                  />{" "}
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={form.gender === "F"}
                    onChange={handleChange}
                  />{" "}
                  Female
                </label>
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="submit-row">
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Saving..." : isEdit ? "Update Patient" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
