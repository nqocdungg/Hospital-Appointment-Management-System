import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaEye, FaSort } from "react-icons/fa"

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([])
  const [q, setQ] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [doctors, setDoctors] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const STATUS_MAP = {
    0: "BOOKED",
    1: "COMPLETED",
    2: "CANCELLED",
    3: "DOCTOR_CANCELLED",
    4: "ABSENT"
  }

  useEffect(() => {
    fetchDoctors()
    fetchAppointments()
  }, [sortDesc])

  async function fetchDoctors() {
    try {
      const res = await axios.get("http://localhost:5050/api/admin/doctors", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctors(res.data)
    } catch {
      setDoctors([])
    }
  }

  async function fetchAppointments() {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5050/api/admin/appointments", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q, doctorId, status, dateFrom, dateTo, sort: sortDesc ? "desc" : "asc" }
      })
      setAppointments(Array.isArray(res.data) ? res.data : [])
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

  const renderStatus = s => {
    switch (s) {
      case 0:
        return <span className="status status-booked">BOOKED</span>
      case 1:
        return <span className="status status-completed">COMPLETED</span>
      case 2:
        return <span className="status status-cancelled">CANCELLED</span>
      case 3:
        return <span className="status status-doctorcancelled">DOCTOR_CANCELLED</span>
      case 4:
        return <span className="status status-absent">ABSENT</span>
      default:
        return <span className="status">UNKNOWN</span>
    }
  }

  if (loading) return <div className="loading">Loading appointments...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header role="admin" />

      <div className="dashboard">
        <Sidebar role="admin" />
        <div className="main">
          <div className="page-header">
            <h2 className="page-title">Appointments Management</h2>
          </div>

          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Search (Patient or Doctor)</label>
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchAppointments()}
                />
              </div>
              <div className="filter-group small">
                <label>Doctor</label>
                <select value={doctorId} onChange={e => setDoctorId(e.target.value)}>
                  <option value="">All</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.user?.fullname}</option>
                  ))}
                </select>
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
                <th>Doctor</th>
                <th>Patient</th>
                <th>Status</th>
                <th width="100">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="7" className="nodata">No appointments found.</td></tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.date ? a.date.slice(0, 10) : "-"}</td>
                    <td>{a.shift ? `${a.shift.startTime} - ${a.shift.endTime}` : "-"}</td>
                    <td>{a.doctorName || "-"}</td>
                    <td>{a.patientName || "-"}</td>
                    <td>{renderStatus(a.status)}</td>
                    <td>
                      <button className="btn-view" onClick={() => navigate(`/admin/appointments/${a.id}`)}>
                        <FaEye title="View" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
