import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FaCalendarPlus,
  FaClipboardList,
  FaUserMd,
  FaHospitalSymbol,
  FaFileMedical,
  FaComments,
} from "react-icons/fa"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function PatientHome() {
  const navigate = useNavigate()
  const storedPatient = localStorage.getItem("patient")
  const patient =
    storedPatient && storedPatient !== "undefined"
      ? JSON.parse(storedPatient)
      : null

  const features = [
    {
      title: "Book My Appointment",
      subtitle: "Book Appointment",
      icon: <FaCalendarPlus />,
      path: "/patient/book-appointments",
    },
    {
      title: "My Appointments",
      subtitle: "View Appointment History",
      icon: <FaClipboardList />,
      path: "/patient/view-my-appointments",
    },
    {
      title: "View Doctors",
      subtitle: "Browse Doctor List",
      icon: <FaUserMd />,
      path: "/patient/view-doctor",
    },
    {
      title: "Medical Records",
      subtitle: "View My Records",
      icon: <FaFileMedical />,
      path: "/patient/medical-records",
    },
    {
      title: "Contact / Help",
      subtitle: "Get Help & Support",
      icon: <FaComments />,
      path: "/patient/support",
    },
  ]

  return (
    <>
      <Header role="patient" />
      <div className="dashboard-container">
        <Sidebar role="patient" active="dashboard" />
        <main className="dashboard-content">
          <h2 className="page-title mb-8">Welcome, {patient?.fullname ? `${patient.fullname}` : ""}</h2>
          <motion.div
            className="patient-dashboard-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
          >
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(item.path)}
                className="patient-feature-card"
              >
                <div className="patient-feature-icon">{item.icon}</div>
                <h3 className="patient-feature-title">{item.title}</h3>
                <p className="patient-feature-subtitle">{item.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </>
  )
}
