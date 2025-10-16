import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Header from "./components/Header"

// Giả lập user (sau này có thể lấy từ context hoặc localStorage)
const demoUser = {
  name: "Ngọc Dung",
  email: "admin@hospital.vn",
  role: "admin",
}

function AdminDashboard() {
  const handleLogout = () => {
    alert("Đăng xuất thành công!")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={demoUser} onLogout={handleLogout} />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Admin Dashboard
        </h2>
        <p className="text-gray-700">
          Đây là trang chủ sau khi đăng nhập của Admin. <br />
          Header ở trên cùng là component dùng chung cho toàn hệ thống.
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Trang admin dashboard demo */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
