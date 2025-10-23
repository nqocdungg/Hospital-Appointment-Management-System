import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function MedicalRecords() {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const token = localStorage.getItem("token")
  const patient = JSON.parse(localStorage.getItem("patient")) || { fullname: "Patient" }

  const loadRecords = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/patient/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data.items || []
      setRecords(data)
    } catch {
      setRecords([])
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  return (
    <>
      <Header role="patient" />
      <div className="dashboard-container">
        <Sidebar role="patient" />
        <main className="dashboard-content">
          <h2 className="page-title mb-4">My Medical Records</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Diagnosis</th>
                  <th>Prescription</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((r, i) => (
                    <tr key={r.appointmentId}>
                      <td>{i + 1}</td>
                      <td>{r.date?.split("T")[0]}</td>
                      <td>{r.time || "-"}</td>
                      <td>{r.doctor}</td>
                      <td>{r.specialty}</td>
                      <td>{r.diagnosis || "-"}</td>
                      <td>{r.prescription || "-"}</td>
                      <td>{r.note || "-"}</td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => setSelected(r)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No medical records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="modal-overlay" onClick={() => setSelected(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="mb-2">Medical Record Detail</h3>
                <p><b>Date:</b> {selected.date?.split("T")[0]}</p>
                <p><b>Time:</b> {selected.time || "-"}</p>
                <p><b>Doctor:</b> {selected.doctor}</p>
                <p><b>Specialty:</b> {selected.specialty}</p>
                <p><b>Diagnosis:</b> {selected.diagnosis || "-"}</p>
                <p><b>Prescription:</b> {selected.prescription || "-"}</p>
                <p><b>Note:</b> {selected.note || "-"}</p>
                <button className="btn-close" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
