import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function PatientDetail() {
  const { id } = useParams()
  const token = localStorage.getItem("token")
  const doctor = JSON.parse(localStorage.getItem("doctor")) || { fullname: "Doctor" }
  const navigate = useNavigate()
  const editable = window.location.pathname.endsWith("/edit")

  const [patient, setPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchDetail() }, [id])

  async function fetchDetail() {
    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:5050/api/doctor/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setPatient(res.data.patient)
      setHistory(res.data.history || [])
    } finally {
      setLoading(false)
    }
  }

  async function saveRow(row) {
    setSaving(true)
    try {
      await axios.patch(`http://localhost:5050/api/doctor/medical-records/${row.appointmentId}`, {
        diagnosis: row.diagnosis || "",
        prescription: row.prescription || "",
        note: row.note || "",
      }, { headers: { Authorization: `Bearer ${token}` } })
    } finally {
      setSaving(false)
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
            <h2 className="page-title">Patient Detail</h2>
          </div>
          <div className="section">
            <h4 className="section-title green">Patient Info</h4>
            <div className="info-grid">
              <p><strong>Name:</strong> {patient?.fullname || "-"}</p>
              <p><strong>Gender:</strong> {patient?.gender === "M" ? "Male" : patient?.gender === "F" ? "Female" : "-"}</p>
              <p><strong>DOB:</strong> {patient?.dob ? new Date(patient.dob).toLocaleDateString() : "-"}</p>
              <p><strong>Phone:</strong> {patient?.phone || "-"}</p>
            </div>
          </div>
          <div className="section">
            <h4 className="section-title purple">Medical History</h4>
            <table className="data-table small">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Note</th>
                  {editable && <th width="120">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={editable ? 6 : 5} className="nodata">No history</td></tr>
                ) : history.map((r, idx) => (
                  <tr key={r.appointmentId}>
                    <td>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                    <td>
                      {r.shift
                        ? `${r.shift.startTime || "-"} - ${r.shift.endTime || "-"}`
                        : r.time || "-"}
                    </td>
                    {!editable ? (
                      <>
                        <td>{r.diagnosis || "-"}</td>
                        <td>{r.prescription || "-"}</td>
                        <td>{r.note || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td><textarea value={r.diagnosis || ""} onChange={e => setHistory(h => { const x = [...h]; x[idx] = { ...x[idx], diagnosis: e.target.value }; return x })} /></td>
                        <td><textarea value={r.prescription || ""} onChange={e => setHistory(h => { const x = [...h]; x[idx] = { ...x[idx], prescription: e.target.value }; return x })} /></td>
                        <td><textarea value={r.note || ""} onChange={e => setHistory(h => { const x = [...h]; x[idx] = { ...x[idx], note: e.target.value }; return x })} /></td>
                        <td className="row-actions">
                          <button className="btn" disabled={saving} onClick={() => saveRow(history[idx])}>Save</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-actions">
            <button className="btn-outline" onClick={() => navigate("/doctor/patients")}>Back</button>
            {editable ? (
              <button className="btn" onClick={() => navigate(`/doctor/patients/${id}`)}>Done</button>
            ) : (
              <button className="btn" onClick={() => navigate(`/doctor/patients/${id}/edit`)}>Edit</button>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
