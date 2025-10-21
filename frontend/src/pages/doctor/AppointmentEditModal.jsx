import { useState } from "react"
import axios from "axios"

export default function AppointmentEditModal({ data, onClose, onSave }) {
  const token = localStorage.getItem("token")
  const [status, setStatus] = useState("")
  const [note, setNote] = useState(data.note || "")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.patch(`http://localhost:5050/api/doctor/appointments/${data.id}/status`, {
        status: Number(status),
        note,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
          <div className="form-group">
            <label>Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Additional note..." />
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
