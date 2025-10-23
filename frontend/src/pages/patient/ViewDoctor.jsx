import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function ViewDoctor() {
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:5050/api/patient/view-doctor", {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true
        })
        if (res.status === 200 && Array.isArray(res.data)) {
          setSpecialties(res.data)
          setError("")
        } else {
          setSpecialties([])
          setError(res.data?.message || "Failed to load doctors")
        }
      } catch {
        setSpecialties([])
        setError("Failed to load doctors")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header title="Doctors by Specialty" role="patient" />

      <div className="dashboard">
        <Sidebar role="patient" />
        <div className="main">
          {specialties.map(sp => (
            <div key={sp.specialtyId} className="specialty-section">
              <div className="specialty-header">
                <h2 className="specialty-title">{sp.specialtyName}</h2>
                {sp.description && <p className="specialty-desc">{sp.description}</p>}
              </div>
              <div className="doctor-card-grid">
                {sp.doctors.length === 0 ? (
                  <p className="nodata">No doctors available.</p>
                ) : (
                  sp.doctors.map(doc => (
                    <div key={doc.id} className="doctor-card">
                      <img src={doc.photo || "/default-doctor.jpg"} alt={doc.fullname} className="doctor-photo" />
                      <div className="doctor-info">
                        <h3 className="doctor-name">{doc.fullname}</h3>
                        <p className="doctor-qualification">{doc.qualification || "—"}</p>
                        <p className="doctor-fee">Consultation fee: {doc.fee ? `${doc.fee.toLocaleString()} VND` : "N/A"}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
