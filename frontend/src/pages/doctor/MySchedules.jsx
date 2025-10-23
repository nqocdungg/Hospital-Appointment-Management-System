import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function MySchedules() {
  const [schedules, setSchedules] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function loadSchedules() {
      try {
        const res = await axios.get("http://localhost:5050/api/doctor/schedules", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = Array.isArray(res.data) ? res.data : []
        setSchedules(data)
        if (data.length > 0 && data[0].date) setSelectedDate(data[0].date.split("T")[0])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSchedules()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  const uniqueDates = [...new Set(schedules.map(s => s.date?.split("T")[0]))].sort((a, b) => new Date(a) - new Date(b))
  const daySchedules = schedules.filter(s => s.date?.split("T")[0] === selectedDate)

  const handleRequestOff = async (id) => {
    if (!window.confirm("Request off for this shift?")) return
    await axios.put(`http://localhost:5050/api/doctor/schedules/${id}/off`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 2 } : s))
  }

  const renderStatus = (s) => {
    switch (s.status) {
      case 0:
        return <span className="status status-free">Free</span>
      case 1:
        return <span className="status status-busy">Busy</span>
      case 2:
        return <span className="status status-off">Day Off</span>
      default:
        return <span className="status">Unknown</span>
    }
  }

  return (
    <>
      <Header role = "doctor"/>
      <div className="dashboard-container">
        <Sidebar role="doctor" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">My Work Schedules</h2>
          </div>

          <div className="schedule-dates">
            {uniqueDates.length === 0 ? (
              <div className="no-data">No schedules found.</div>
            ) : (
              uniqueDates.map(date => (
                <button
                  key={date}
                  className={`date-btn ${selectedDate === date ? "active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </button>
              ))
            )}
          </div>

          {daySchedules.length === 0 ? (
            <p className="no-data">Select a date to view your shifts.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Period</th>
                  <th>Time</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {daySchedules.map((s, i) => (
                  <tr key={i}>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                    <td>{s.shift?.period || "-"}</td>
                    <td>{s.shift ? `${s.shift.startTime} - ${s.shift.endTime}` : "-"}</td>
                    <td>{s.doctor?.specialty || "-"}</td>
                    <td>{renderStatus(s)}</td>
                    <td>
                      {s.status === 0 ? (
                        <button className="btn-warning" onClick={() => handleRequestOff(s.id)}>Request Off</button>
                      ) : (
                        <button className="btn-disabled" disabled>-</button>
                      )}
                    </td>
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
