import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa"

export default function DoctorList() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await axios.get("http://localhost:5050/api/admin/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setDoctors(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load doctors.")
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return
    try {
      await axios.delete(`http://localhost:5050/api/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDoctors(doctors.filter((d) => d.id !== id))
      alert("Doctor deleted successfully.")
    } catch (err) {
      console.error(err)
      alert("Failed to delete doctor.")
    }
  }

  if (loading) return <div className="loading">Loading doctors...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">Manage Doctors</h2>
            <button className="small-add-btn" onClick={() => navigate("/admin/doctors/new")}>
              + Add
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fullname</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialty</th>
                <th>Fee (VND)</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.user.fullname}</td>
                  <td>{doc.user.email}</td>
                  <td>{doc.user.phone || "—"}</td>
                  <td>{doc.specialty?.name || "—"}</td>
                  <td>{doc.fee?.toLocaleString() || "—"}</td>
                  <td>{doc.gender === "M" ? "Male" : doc.gender === "F" ? "Female" : "—"}</td>
                  <td>
                    <button className="btn-view" onClick={() => navigate(`/admin/doctors/${doc.id}`)}>
                      <FaEye />
                    </button>
                    <button className="btn-edit" onClick={() => navigate(`/admin/doctors/edit/${doc.id}`)}>
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(doc.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </>
  )
}
