import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function AppointmentBooking() {
  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [form, setForm] = useState({ specialtyId: "", doctorId: "", date: "", shiftId: "", symptom: "", request: "" })
  const token = localStorage.getItem("token")
  const patient = JSON.parse(localStorage.getItem("patient")) || { fullname: "Patient" }

  useEffect(() => {
    axios.get("http://localhost:5050/api/patient/appointments/specialties", {
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }
    })
    .then(res => setSpecialties(Array.isArray(res.data) ? res.data : []))
    .catch(() => setSpecialties([]))
  }, [])

  useEffect(() => {
    setForm(prev => ({ ...prev, doctorId: "", date: "", shiftId: "" }))
    setDoctors([]); setAvailableDates([]); setSchedules([])
  }, [form.specialtyId])

  useEffect(() => {
    if (!form.specialtyId) return
    axios.get(`http://localhost:5050/api/patient/appointments/doctors?specialtyId=${form.specialtyId}`, {
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }
    })
    .then(res => setDoctors(Array.isArray(res.data) ? res.data : []))
    .catch(() => setDoctors([]))
  }, [form.specialtyId])

  useEffect(() => {
    setForm(prev => ({ ...prev, date: "", shiftId: "" }))
    setAvailableDates([]); setSchedules([])
    if (!form.doctorId) return
    axios.get(`http://localhost:5050/api/patient/appointments/available-dates?doctorId=${form.doctorId}`, {
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }
    })
    .then(res => {
      const today = new Date(); today.setHours(0,0,0,0)
      const keep = (Array.isArray(res.data) ? res.data : []).filter(d => new Date(d).getTime() >= today.getTime())
      setAvailableDates(keep)
    })
    .catch(() => setAvailableDates([]))
  }, [form.doctorId])

  useEffect(() => {
    setForm(prev => ({ ...prev, shiftId: "" }))
    setSchedules([])
    if (!form.doctorId || !form.date) return
    axios.get(`http://localhost:5050/api/patient/appointments/schedules?doctorId=${form.doctorId}&date=${form.date}`, {
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }
    })
    .then(res => setSchedules(Array.isArray(res.data) ? res.data : []))
    .catch(() => setSchedules([]))
  }, [form.doctorId, form.date])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleBook = async () => {
    const { specialtyId, doctorId, date, shiftId, symptom } = form
    if (!specialtyId || !doctorId || !date || !shiftId || !symptom.trim()) {
      alert("Please fill in all required fields (Symptom is required).")
      return
    }
    try {
      await axios.post("http://localhost:5050/api/patient/appointments", form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert("Appointment booked successfully!")
      setForm({ specialtyId: "", doctorId: "", date: "", shiftId: "", symptom: "", request: "" })
      setDoctors([]); setSchedules([]); setAvailableDates([])
    } catch {
      alert("Failed to book appointment.")
    }
  }

  return (
    <>
      <Header role="patient" />
      <div className="dashboard-container">
        <Sidebar role="patient" />
        <main className="dashboard-content">
          <h2 className="page-title mb-4">Book Appointment</h2>
          <div className="form-container">
            <form className="form-grid">
              <div className="form-group">
                <label>Specialty</label>
                <select name="specialtyId" value={form.specialtyId} onChange={handleChange}>
                  <option value="">-- Select Specialty --</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor</label>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} disabled={!form.specialtyId}>
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullname}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Available Dates</label>
                <div className="date-list">
                  {availableDates.length === 0 && <p className="no-date">No available dates.</p>}
                  {availableDates.map(d => (
                    <button key={d} type="button"
                      className={`date-btn ${form.date === d ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, date: d })}>
                      {new Date(d).toLocaleDateString("en-GB")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Shift</label>
                <select name="shiftId" value={form.shiftId} onChange={handleChange} disabled={!form.date}>
                  <option value="">-- Select Shift --</option>
                  {schedules.map(sh => (
                    <option key={sh.shiftId} value={sh.shiftId}>
                      {`Shift ${sh.shiftId} (${sh.startTime} - ${sh.endTime})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Symptom <span className="required">*</span></label>
                <textarea name="symptom" rows="3" placeholder="Describe your symptoms..." value={form.symptom} onChange={handleChange}></textarea>
              </div>
              <div className="form-group full-width">
                <label>Special Request (optional)</label>
                <textarea name="request" rows="2" placeholder="Enter any specific request..." value={form.request} onChange={handleChange}></textarea>
              </div>
              <div className="submit-row">
                <button type="button" className="btn" onClick={handleBook}>Book Appointment</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}
