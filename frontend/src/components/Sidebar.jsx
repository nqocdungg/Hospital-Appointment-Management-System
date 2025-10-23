import { Link, useLocation } from "react-router-dom"
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaHospitalSymbol,
  FaCalendarAlt,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaFileMedical,
  FaComments
} from "react-icons/fa"

export default function Sidebar({ role = "admin" }) {
  const location = useLocation()

  const adminMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { label: "Doctors List", icon: <FaUserMd />, path: "/admin/doctors" },
    { label: "Patients List", icon: <FaUsers />, path: "/admin/patients" },
    { label: "Work Schedules", icon: <FaCalendarAlt />, path: "/admin/schedules" },
    { label: "View Departments", icon: <FaHospitalSymbol />, path: "/admin/departments" },
    { label: "View Appointments", icon: <FaClipboardList />, path: "/admin/appointments" },
  ]

  const doctorMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/doctor/dashboard" },
    { label: "My Appointments", icon: <FaClipboardList />, path: "/doctor/appointments" },
    { label: "My Schedule", icon: <FaCalendarAlt />, path: "/doctor/schedules" },
    { label: "My Patients", icon: <FaUsers />, path: "/doctor/patients" },
  ]

  const patientMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/patient/home" },
    { label: "Book Appointment", icon: <FaCalendarAlt />, path: "/patient/book-appointments" },
    { label: "My Appointments", icon: <FaClipboardList />, path: "/patient/view-my-appointments" },
    { label: "View Doctors", icon: <FaUserMd />, path: "/patient/view-doctor" },
    { label: "Medical Records", icon: <FaFileMedical />, path: "/patient/medical-records" },
    { label: "Contact / Help", icon: <FaComments />, path: "/patient/support" },
  ]

  const menuItems =
    role === "admin" ? adminMenu :
    role === "doctor" ? doctorMenu :
    patientMenu

  return (
    <aside className="sidebar">
      <ul>
        {menuItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <li key={index} className={isActive ? "active" : ""}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
