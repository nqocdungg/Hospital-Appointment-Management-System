import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/admin/AdminDashboard"
import DoctorList from "./pages/admin/DoctorList"
import DoctorForm from "./pages/admin/DoctorForm"
import PatientList from "./pages/admin/PatientList"
import PatientForm from "./pages/admin/PatientForm"
import DepartmentDetail from "./pages/admin/DepartmentDetail"
import DepartmentForm from "./pages/admin/DepartmentForm"
import DepartmentList from "./pages/admin/DepartmentList"

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute>
              <DoctorList />
            </ProtectedRoute>
          }
        />

<Route
  path="/admin/doctors/new"
  element={
    <ProtectedRoute>
      <DoctorForm mode="add" />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/doctors/edit/:id"
  element={
    <ProtectedRoute>
      <DoctorForm mode="edit" />
    </ProtectedRoute>
  }
/>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
          <Route path="/admin/patients" element={<PatientList />} />
        <Route path="/admin/patients/add" element={<PatientForm mode="add" />} />
        <Route path="/admin/patients/edit/:id" element={<PatientForm mode="edit" />} />
        <Route path="/admin/departments" element = {<DepartmentList/>}/>
        <Route path="/admin/departments/new" element = {<DepartmentForm mode = "add"/>}/>
        <Route path="/admin/departments/edit/:id" element = {<DepartmentList mode="edit"/>}/>
        <Route path="/admin/departments/:id" element = {<DepartmentDetail />}/>
      </Routes>
    </BrowserRouter>
  )
}
