import { useState } from "react"
import { FaHospitalUser, FaBars, FaBell } from "react-icons/fa"
import { Link } from 'react-router'

export default function Header({ user, onLogout }) {
    const [showMenu, setShowMenu] = useState(false)
  return (
    <header className="header">
      <div className = "left-section">
        <Link to = "/admin/dashboard" className = "header-link">
            <FaHospitalUser size = {30}/>
            <h1 className="Logo">HAMS HOSPITAL</h1>
        </Link>
      </div>

      <div className="right-section">
        <span className = "welcome-text">Welcome, <strong>{user?.name || "Admin"}</strong></span>

        <button className="notification-btn">
          <FaBell size={20} />
        </button>

        <div
          className="menu-container"
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <button className="menu-btn">
            <FaBars size={20} />
          </button>

          {showMenu && (
            <div className="dropdown-menu">
              <button className="dropdown-item">User Information</button>
              <button className="dropdown-item" onClick={onLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
