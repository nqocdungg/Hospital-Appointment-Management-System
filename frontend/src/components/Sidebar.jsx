import {Link, useLocation} from "react-router-dom"
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaHospitalSymbol,
  FaCalendarAlt,
  FaClipboardList,
  FaChartBar,
  FaCog
} from "react-icons/fa"

export default function Sidebar({role="admin"}){
  const location = useLocation()
  console.log("Current path: ", location.pathname)

  const adminMenu = [
    {label: "Dashboard", icon: <FaTachometerAlt/>, path: "/admin/dashboard"},
    {label: "Doctor List", icon: <FaUserMd/>, path: "/admin/doctors"},
    {label: "Patient List", icon: <FaUsers />, path: "/admin/patients" },
    {label: "Departments", icon: <FaHospitalSymbol />, path: "/admin/departments" },
    {label: "Schedules", icon: <FaCalendarAlt />, path: "/admin/schedules" },
    {label: "Appointments", icon: <FaClipboardList />, path: "/admin/appointments" },
    {label: "Reports", icon: <FaChartBar />, path: "/admin/reports" },
    {label: "Settings", icon: <FaCog />, path: "/admin/settings" },
  ]

  const doctorMenu = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/doctor/dashboard" },
    { label: "My Appointments", icon: <FaClipboardList />, path: "/doctor/appointments" },
    { label: "My Schedule", icon: <FaCalendarAlt />, path: "/doctor/schedule" },
    { label: "My Patients", icon: <FaUsers />, path: "/doctor/patients" },
    { label: "Reports", icon: <FaChartBar />, path: "/doctor/reports" },
  ]
  const menuItems = role === "admin" ? adminMenu : doctorMenu

  return (
    <aside className="sidebar">
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className={location.pathname.startsWith(item.path) ? "active" : ""}>
            <Link to={item.path}>
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )



}