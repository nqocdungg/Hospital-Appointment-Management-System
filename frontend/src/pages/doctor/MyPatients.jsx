import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaEye, FaEdit } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function MyPatients() {
  const token = localStorage.getItem("token")
  const doctor = JSON.parse(localStorage.getItem("doctor")) || { fullname: "Doctor" }
  const [items, setItems] = useState([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchPatients() }, [])

  async function fetchPatients() {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5050/api/doctor/patients", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q },
      })
      setItems(res.data.items || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <>
      <Header role="doctor" />
      <div className="dashboard-container">
        <Sidebar role="doctor" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">My Patients</h2>
          </div>
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search</label>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or phone..." onKeyDown={e => e.key==="Enter" && fetchPatients()} />
              </div>
              <div className="filter-actions">
                <button className="btn" onClick={fetchPatients}>Filter</button>
              </div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Last Appointment</th>
                <th>Total Visits</th>
                <th width="140">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length===0 ? (
                <tr><td colSpan="6" className="nodata">No patients</td></tr>
              ) : items.map(p => (
                <tr key={p.patientId}>
                  <td>{p.fullname}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "-"}</td>
                  <td>{p.lastAppointment ? new Date(p.lastAppointment).toLocaleDateString() : "-"}</td>
                  <td>{p.totalVisits}</td>
                  <td className="row-actions">
                    <button className="btn-view" title="View" onClick={() => navigate(`/doctor/patients/${p.patientId}`)}><FaEye /></button>
                    <button className="btn-edit" title="Edit" onClick={() => navigate(`/doctor/patients/${p.patientId}/edit`)}><FaEdit /></button>
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
