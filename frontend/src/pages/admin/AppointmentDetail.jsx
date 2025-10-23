import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaArrowLeft } from "react-icons/fa"

export default function AppointmentDetail() {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const STATUS_MAP = {
    0: "BOOKED",
    1: "COMPLETED",
    2: "CANCELLED",
    3: "DOCTOR_CANCELLED",
    4: "ABSENT",
  }

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await axios.get(`http://localhost:5050/api/admin/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAppointment(res.data)
      } catch {
        setError("Failed to load appointment detail.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!appointment) return <div>No appointment found.</div>

  const a = appointment
  const p = a.patient || {}
  const d = a.doctor || {}
  const r = a.record || {}
  const s = a.shift || {}

  return (
    <>
      <Header role="admin" />

      <div className="dashboard-container">
        <Sidebar role="admin" />
        <div className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">Appointment Detail</h2>
            <button className="btn-outline" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </button>
          </div>

          <div className="appointment-container">
            <div className="detail-section">
              <h3 className="section-title blue">Appointment Info</h3>
              <div className="info-grid">
                <div><strong>ID:</strong> {a.id}</div>
                <div><strong>Date:</strong> {a.date ? a.date.slice(0, 10) : "-"}</div>
                <div><strong>Time:</strong> {s.startTime} - {s.endTime}</div>
                <div><strong>Status:</strong> {STATUS_MAP[a.status] || "UNKNOWN"}</div>
                <div><strong>Symptom:</strong> {a.symptom || "-"}</div>
                <div><strong>Request:</strong> {a.request || "-"}</div>
                <div><strong>Note:</strong> {a.note || "-"}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title green">Doctor Info</h3>
              <div className="info-grid">
                <div><strong>Name:</strong> {d.fullname || "-"}</div>
                <div><strong>Specialty:</strong> {d.specialtyName || "-"}</div>
                <div><strong>Phone:</strong> {d.phone || "-"}</div>
                <div><strong>Fee:</strong> {d.fee ? `$${d.fee}` : "-"}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title purple">Patient Info</h3>
              <div className="info-grid">
                <div><strong>Name:</strong> {p.fullname || "-"}</div>
                <div><strong>Gender:</strong> {p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "-"}</div>
                <div><strong>DOB:</strong> {p.dob ? new Date(p.dob).toLocaleDateString() : "-"}</div>
                <div><strong>Phone:</strong> {p.phone || "-"}</div>
                <div><strong>Email:</strong> {p.email || "-"}</div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="section-title blue">Medical Record</h3>
              {r ? (
                <div className="info-grid">
                  <div><strong>Diagnosis:</strong> {r.diagnosis || "-"}</div>
                  <div><strong>Prescription:</strong> {r.prescription || "-"}</div>
                  <div><strong>Note:</strong> {r.note || "-"}</div>
                </div>
              ) : (
                <p className="nodata">No medical record found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
