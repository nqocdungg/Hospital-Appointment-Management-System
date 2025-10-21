import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaEye, FaEdit, FaTrash, FaSort } from "react-icons/fa"
import AppointmentViewModal from "./AppointmentViewModal"
import AppointmentEditModal from "./AppointmentEditModal"

export default function AppointmentList() {
  const token = localStorage.getItem("token")
  const doctor = JSON.parse(localStorage.getItem("doctor")) || { fullname: "Doctor" }

  const [appointments, setAppointments] = useState([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewDetail, setViewDetail] = useState(null)
  const [editDetail, setEditDetail] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchAppointments() }, [sortDesc])

  async function fetchAppointments() {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5050/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q, status, dateFrom, dateTo, sort: sortDesc ? "desc" : "asc" },
      })
      setAppointments(res.data.items || [])
    } catch {
      setError("Failed to load appointments.")
    } finally {
      setLoading(false)
    }
  }

  function toggleSort() {
    setSortDesc(p => !p)
    setTimeout(fetchAppointments, 0)
  }

  async function cancelAppointment(id) {
    if (!window.confirm("Cancel this appointment?")) return
    try {
      setUpdating(true)
      await axios.patch(`http://localhost:5050/api/doctor/appointments/${id}/status`, { status: 2 }, { headers: { Authorization: `Bearer ${token}` } })
      fetchAppointments()
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="loading">Loading appointments...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header user={doctor} role="doctor" />
      <div className="dashboard-container">
        <Sidebar role="doctor" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">My Appointments</h2>
          </div>

          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Patient Name</label>
                <input type="text" placeholder="Search by name..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAppointments()} />
              </div>
              <div className="filter-group small">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="0">BOOKED</option>
                  <option value="1">COMPLETED</option>
                  <option value="2">CANCELLED</option>
                  <option value="3">DOCTOR_CANCELLED</option>
                  <option value="4">ABSENT</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Date from</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Date to</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <div className="filter-actions">
                <button className="btn" onClick={fetchAppointments}>Filter</button>
                <button className="btn-outline" onClick={toggleSort}><FaSort /> {sortDesc ? "Sort Desc" : "Sort Asc"}</button>
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Status</th>
                <th width="120">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="7" className="nodata">No appointments found.</td></tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.shift ? `${a.shift.startTime} - ${a.shift.endTime}` : "-"}</td>
                    <td>{a.patient?.fullname || "-"}</td>
                    <td>{a.patient?.phone || "-"}</td>
                    <td>{a.status}</td>
                    <td className="row-actions">
                      <button className="btn-view" title="View" onClick={() => setViewDetail(a)}><FaEye /></button>
                      <button className="btn-edit" title="Edit" onClick={() => setEditDetail(a)}><FaEdit /></button>
                      <button className="btn-delete" title="Cancel" onClick={() => cancelAppointment(a.id)} disabled={updating}><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {viewDetail && <AppointmentViewModal data={viewDetail} onClose={() => setViewDetail(null)} />}
          {editDetail && <AppointmentEditModal data={editDetail} onClose={() => setEditDetail(null)} onSave={fetchAppointments} />}
        </main>
      </div>
    </>
  )
}
