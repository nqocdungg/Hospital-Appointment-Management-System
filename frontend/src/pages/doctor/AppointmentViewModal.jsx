import { useEffect, useState } from "react"
import axios from "axios"

export default function AppointmentViewModal({ data, onClose }) {
  const token = localStorage.getItem("token")
  const [detail, setDetail] = useState(null)
  const [records, setRecords] = useState([])

  useEffect(() => {
    fetchDetail()
  }, [])

  async function fetchDetail() {
    try {
      const res = await axios.get(`http://localhost:5050/api/doctor/appointments/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDetail(res.data)
      if (res.data.patient?.id) fetchRecords(res.data.patient.id)
    } catch (err) {
      setDetail(null)
    }
  }

  async function fetchRecords(patientId) {
    try {
      const res = await axios.get(`http://localhost:5050/api/doctor/appointments/records/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const arr = Array.isArray(res.data) ? res.data : []
      setRecords(arr)
    } catch {
      setRecords([])
    }
  }

  if (!detail) return (
    <div className="modal">
      <div className="modal-body large"><p>Loading detail...</p></div>
    </div>
  )

  return (
    <div className="modal">
      <div className="modal-body large">
        <h3 className="modal-title">Appointment #{detail.id}</h3>
        <div className="section">
          <h4 className="section-title blue">Appointment Detail</h4>
          <div className="info-grid">
            <p><strong>Date:</strong> {detail.date ? new Date(detail.date).toLocaleDateString() : "-"}</p>
            <p><strong>Time:</strong> {detail.shift ? `${detail.shift.startTime} - ${detail.shift.endTime}` : "-"}</p>
            <p><strong>Status:</strong> {detail.status}</p>
            <p><strong>Symptoms:</strong> {detail.symptom || "-"}</p>
            <p><strong>Special Request:</strong> {detail.request || "-"}</p>
            <p><strong>Note:</strong> {detail.note || "-"}</p>
          </div>
        </div>
        <div className="section">
          <h4 className="section-title green">Patient Info</h4>
          <div className="info-grid">
            <p><strong>Name:</strong> {detail.patient?.fullname || "-"}</p>
            <p><strong>Gender:</strong> {detail.patient?.gender === "M" ? "Male" : detail.patient?.gender === "F" ? "Female" : "-"}</p>
            <p><strong>DOB:</strong> {detail.patient?.dob ? new Date(detail.patient.dob).toLocaleDateString() : "-"}</p>
            <p><strong>Phone:</strong> {detail.patient?.phone || "-"}</p>
          </div>
        </div>
        <div className="section">
          <h4 className="section-title purple">Medical History</h4>
          <table className="data-table small">
            <thead>
              <tr>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {(!records || records.length === 0) ? (
                <tr><td colSpan="4" className="nodata">No medical records found.</td></tr>
              ) : (
                records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.appointmentDate ? new Date(r.appointmentDate).toLocaleDateString() : "-"}</td>
                    <td>{r.diagnosis || "-"}</td>
                    <td>{r.prescription || "-"}</td>
                    <td>{r.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
