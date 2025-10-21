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
    { label: "Doctors", icon: <FaUserMd />, path: "/admin/doctors" },
    { label: "Patients", icon: <FaUsers />, path: "/admin/patients" },
    { label: "Departments", icon: <FaHospitalSymbol />, path: "/admin/departments" },
    { label: "Work Schedules", icon: <FaCalendarAlt />, path: "/admin/schedules" },
    { label: "Appointments", icon: <FaClipboardList />, path: "/admin/appointments" },
    { label: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
    { label: "Settings", icon: <FaCog />, path: "/admin/settings" },
  ]

  const doctorMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/doctor/dashboard" },
    { label: "My Appointments", icon: <FaClipboardList />, path: "/doctor/appointments" },
    { label: "My Schedule", icon: <FaCalendarAlt />, path: "/doctor/schedule" },
    { label: "My Patients", icon: <FaUsers />, path: "/doctor/patients" },
    { label: "Reports", icon: <FaChartBar />, path: "/doctor/reports" },
  ]

  const patientMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/patient/home" },
    { label: "Book Appointment", icon: <FaCalendarAlt />, path: "/patient/book-appointments" },
    { label: "My Appointments", icon: <FaClipboardList />, path: "/patient/view-my-appointments" },
    { label: "Doctors", icon: <FaUserMd />, path: "/patient/doctors" },
    { label: "Departments", icon: <FaHospitalSymbol />, path: "/patient/departments" },
    { label: "Medical Records", icon: <FaFileMedical />, path: "/patient/records" },
    { label: "Support", icon: <FaComments />, path: "/patient/contact" },
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
