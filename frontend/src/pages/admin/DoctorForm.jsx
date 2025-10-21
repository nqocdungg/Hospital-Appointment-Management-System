// frontend/src/pages/admin/DoctorForm.jsx
import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function DoctorForm() {
  const location = useLocation()
  const mode = location.state?.mode || "add"
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    qualification: "",
    fee: "",
    specialtyId: "",
    photo: "",
  })
  const [preview, setPreview] = useState("")
  const [specialties, setSpecialties] = useState([])
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem("token")

  useEffect(() => {
    axios.get("http://localhost:5050/api/admin/departments", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setSpecialties(Array.isArray(res.data) ? res.data : []))
  }, [token])

  useEffect(() => {
    if (mode === "edit" && id) {
      axios.get(`http://localhost:5050/api/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        const d = res.data
        setForm({
          fullname: d.user?.fullname || "",
          email: d.user?.email || "",
          password: "",
          phone: d.user?.phone || "",
          gender: d.gender || "",
          qualification: d.qualification || "",
          fee: (d.fee ?? "").toString(),
          specialtyId: d.specialty?.id ? String(d.specialty.id) : d.specialtyId ? String(d.specialtyId) : "",
          photo: d.photo || "",
        })
        if (d.photo) setPreview(`http://localhost:5050${d.photo}`)
      })
    }
  }, [mode, id, token])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append("photo", file)
    const res = await axios.post("http://localhost:5050/api/admin/doctors/upload", fd, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    })
    setForm({ ...form, photo: res.data.path })
    setPreview(`http://localhost:5050${res.data.path}`)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (mode === "add") {
      await axios.post("http://localhost:5050/api/admin/doctors", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } else {
      await axios.put(`http://localhost:5050/api/admin/doctors/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    navigate("/admin/doctors")
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" active="doctors" />
        <main className="dashboard-content">
          <div className="page-header" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-start" }}>
            <button className="back-icon" onClick={() => navigate("/admin/doctors")}><FaArrowLeft /></button>
            <h2 className="page-title">{mode === "add" ? "Add Doctor" : "Edit Doctor"}</h2>
          </div>
          <div className="form-container">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-group"><label>Full Name</label><input name="fullname" value={form.fullname} onChange={handleChange} autoComplete="off" /></div>
              <div className="form-group"><label>Email</label><input name="email" value={form.email} onChange={handleChange} autoComplete="off" /></div>
              {mode === "add" && <div className="form-group"><label>Password</label><input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" /></div>}
              <div className="form-group"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} autoComplete="off" /></div>
              <div className="form-group"><label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="form-group"><label>Qualification</label><input name="qualification" value={form.qualification || ""} onChange={handleChange} /></div>
              <div className="form-group"><label>Fee</label><input name="fee" value={form.fee} onChange={handleChange} /></div>
              <div className="form-group"><label>Specialty</label>
                <select name="specialtyId" value={form.specialtyId} onChange={handleChange}>
                  <option value="">Select Specialty</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && <img src={preview} alt="preview" className="doctor-preview" />}
              </div>
              <div className="submit-row">
                <button type="submit" className="btn">Save</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
