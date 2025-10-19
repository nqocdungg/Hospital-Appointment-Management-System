import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

export default function DashboardLayout({ role, user, onLogout, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <div className="main-content">
        <Header role={role} user={user} onLogout={onLogout} />
        <div className="content-body">{children}</div>
      </div>
    </div>
  )
}
