import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa"

export default function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await axios.get("http://localhost:5050/api/admin/patients", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPatients(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load patients.")
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this patient?")) return
    try {
      await axios.delete(`http://localhost:5050/api/admin/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatients(patients.filter((p) => p.id !== id))
      alert("Patient deleted successfully.")
    } catch (err) {
      console.error(err)
      alert("Failed to delete patient.")
    }
  }

  if (loading) return <div className="loading">Loading patients...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">Manage Patients</h2>
            <button className="small-add-btn" onClick={() => navigate("/admin/patients/add")}>
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
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.user?.fullname || "-"}</td>
                  <td>{p.user?.email || "-"}</td>
                  <td>{p.user?.phone || "-"}</td>
                  <td>{p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "-"}</td>
                  <td>{p.dob ? new Date(p.dob).toLocaleDateString() : "-"}</td>
                  <td>
                    <button className="btn-view" onClick={() => navigate(`/admin/patients/${p.id}`)}>
                      <FaEye />
                    </button>
                    <button className="btn-edit" onClick={() => navigate(`/admin/patients/edit/${p.id}`)}>
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>
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
