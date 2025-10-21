import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([])
  const token = localStorage.getItem("token")
  const patient = JSON.parse(localStorage.getItem("patient")) || { fullname: "Patient" }

  const loadAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/patient/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAppointments(Array.isArray(res.data) ? res.data : [])
    } catch {
      setAppointments([])
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const handleCancel = async (id, date) => {
    const today = new Date().toISOString().split("T")[0]
    if (date <= today) {
      alert("You cannot cancel past appointments.")
      return
    }
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    try {
      await axios.post(`http://localhost:5050/api/patient/appointments/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Appointment cancelled successfully.")
      loadAppointments()
    } catch {
      alert("Failed to cancel appointment.")
    }
  }

  const isFutureDate = d => new Date(d) > new Date()

  return (
    <>
      <Header user={patient} role="patient" />
      <div className="dashboard-container">
        <Sidebar role="patient" />
        <main className="dashboard-content">
          <h2 className="page-title mb-4">My Appointments</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Symptom</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>{a.doctorName}</td>
                      <td>{a.specialtyName}</td>
                      <td>{a.date}</td>
                      <td>{a.shiftName}</td>
                      <td>{a.symptom || "-"}</td>
                      <td
                        className={
                          a.status === "Booked"
                            ? "status-booked"
                            : a.status === "Completed"
                            ? "status-completed"
                            : a.status === "Cancelled"
                            ? "status-cancelled"
                            : a.status === "DoctorCancelled"
                            ? "status-doctorcancelled"
                            : "status-absent"
                        }
                      >
                        {a.status}
                      </td>
                      <td>
                        {a.status === "Booked" && isFutureDate(a.date) ? (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancel(a.id, a.date)}
                          >
                            Cancel
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  )
}
