import { useState } from "react"
import axios from "axios"

export default function AppointmentEditModal({ data, onClose, onSave }) {
  const token = localStorage.getItem("token")
  const [status, setStatus] = useState("")
  const [note, setNote] = useState(data.note || "")
  const [diagnosis, setDiagnosis] = useState("")
  const [prescription, setPrescription] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.patch(`http://localhost:5050/api/doctor/appointments/${data.id}/status`, { status: Number(status), note }, { headers: { Authorization: `Bearer ${token}` } })
      if (Number(status) === 1) {
        await axios.post(`http://localhost:5050/api/doctor/medical-records/${data.id}`, { diagnosis, prescription, note }, { headers: { Authorization: `Bearer ${token}` } })
      }
      onSave()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal">
      <div className="modal-body small">
        <h3>Edit Appointment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} required>
              <option value="">Select status</option>
              <option value="0">BOOKED</option>
              <option value="1">COMPLETED</option>
              <option value="2">CANCELLED</option>
              <option value="3">DOCTOR_CANCELLED</option>
              <option value="4">ABSENT</option>
            </select>
          </div>
          {status === "1" && (
            <>
              <div className="form-group">
                <label>Diagnosis</label>
                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <textarea value={prescription} onChange={e => setPrescription(e.target.value)} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
