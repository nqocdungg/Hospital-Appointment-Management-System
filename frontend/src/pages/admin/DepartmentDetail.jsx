import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import axios from "axios"

export default function DepartmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [dep, setDep] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await axios.get(`http://localhost:5050/api/admin/departments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        setDep(res.data)
      } catch {
        setError("Failed to load department.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!dep) return <div className="error">Not found.</div>

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">{dep.name}</h2>
            <button className="small-add-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <p><strong>ID:</strong> {dep.id}</p>
            <p><strong>Description:</strong> {dep.description || "—"}</p>
          </div>
          <h3 style={{ marginTop: 15, marginBottom: 10 }}>Doctors in this Department</h3>
          {!dep.doctors || dep.doctors.length === 0 ? (
            <p>No doctors assigned to this department.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fullname</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Fee (VND)</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {dep.doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.id}</td>
                    <td>{doc.user?.fullname}</td>
                    <td>{doc.user?.email}</td>
                    <td>{doc.user?.phone || "—"}</td>
                    <td>{doc.fee?.toLocaleString() || "—"}</td>
                    <td>{doc.gender === "M" ? "Male" : doc.gender === "F" ? "Female" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </>
  )
}
