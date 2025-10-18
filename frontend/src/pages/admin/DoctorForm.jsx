import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function DoctorForm({ mode = "add" }) {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    qualification: "",
    fee: "",
    specialtyId: "",
  })
  const [specialties, setSpecialties] = useState([])
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function loadSpecialties() {
      const res = await axios.get("http://localhost:5050/api/admin/specialties", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSpecialties(res.data)
    }
    loadSpecialties()
    if (mode === "edit" && id) {
      axios
        .get("http://localhost:5050/api/admin/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const doctor = res.data.find((d) => d.id == id)
          if (doctor)
            setForm({
              fullname: doctor.user.fullname,
              email: doctor.user.email,
              phone: doctor.user.phone || "",
              gender: doctor.gender || "",
              qualification: doctor.qualification || "",
              fee: doctor.fee || "",
              specialtyId: doctor.specialty?.id || "",
            })
        })
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (mode === "add") {
        await axios.post("http://localhost:5050/api/admin/doctors", form, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        await axios.put(`http://localhost:5050/api/admin/doctors/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      alert(mode === "add" ? "Doctor added successfully!" : "Doctor updated successfully!")
      navigate("/admin/doctors")
    } catch (err) {
      console.error(err)
      alert("Failed to save doctor.")
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role={localStorage.getItem("role")?.toLowerCase()} />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">
              <FaArrowLeft className="back-icon" onClick={() => navigate("/admin/doctors")} />
              {mode === "add" ? "Add Doctor" : "Edit Doctor"}
            </h2>
          </div>
          <div className="doctor-form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullname" value={form.fullname} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              {mode === "add" && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required />
                </div>
              )}
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0901234567" />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. Resident Doctor, Specialist, PhD" />
              </div>
              <div className="form-group">
                <label>Fee (VND)</label>
                <input type="number" name="fee" value={form.fee} onChange={handleChange} placeholder="e.g. 500000" />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <select name="specialtyId" value={form.specialtyId} onChange={handleChange} required>
                  <option value="">Select Specialty</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group gender-group">
                <label>Gender</label>
                <label>
                  <input type="radio" name="gender" value="M" checked={form.gender === "M"} onChange={handleChange} /> Male
                </label>
                <label>
                  <input type="radio" name="gender" value="F" checked={form.gender === "F"} onChange={handleChange} /> Female
                </label>
              </div>
              <div className="submit-row">
                <button type="submit" className="auth-btn">
                  {mode === "add" ? "Add Doctor" : "Update Doctor"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
