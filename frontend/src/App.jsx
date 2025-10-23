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
import ScheduleList from "./pages/admin/ScheduleList"
import AppointmentDetail from "./pages/admin/AppointmentDetail"
import AdminAppointmentList from "./pages/admin/AppointmentList"
import DoctorDashboard from "./pages/doctor/DoctorDashboard"
import AppointmentList from "./pages/doctor/AppointmentList"
import MyPatients from "./pages/doctor/MyPatients"
import PatientDetail from "./pages/doctor/PatientDetail"
import MySchedules from "./pages/doctor/MySchedules"
import PatientHome from "./pages/patient/PatientHome"
import AppointmentBooking from "./pages/patient/AppointmentBooking"
import ViewAppointments from "./pages/patient/ViewAppointments"
import Support from "./pages/patient/Support"
import MedicalRecords from "./pages/patient/MedicalRecords"
import ViewDoctor from "./pages/patient/ViewDoctor"
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")?.toLowerCase()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRole && role !== allowedRole) {
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />
    if (role === "doctor") return <Navigate to="/doctor/dashboard" replace />
    if (role === "patient") return <Navigate to="/patient/home" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><DoctorList /></ProtectedRoute>} />
        <Route path="/admin/doctors/new" element={<ProtectedRoute allowedRole="admin"><DoctorForm mode="add" /></ProtectedRoute>} />
        <Route path="/admin/doctors/edit/:id" element={<ProtectedRoute allowedRole="admin"><DoctorForm mode="edit" /></ProtectedRoute>} />
        <Route path="/admin/patients" element={<ProtectedRoute allowedRole="admin"><PatientList /></ProtectedRoute>} />
        <Route path="/admin/patients/add" element={<ProtectedRoute allowedRole="admin"><PatientForm mode="add" /></ProtectedRoute>} />
        <Route path="/admin/patients/edit/:id" element={<ProtectedRoute allowedRole="admin"><PatientForm mode="edit" /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute allowedRole="admin"><DepartmentList /></ProtectedRoute>} />
        <Route path="/admin/departments/new" element={<ProtectedRoute allowedRole="admin"><DepartmentForm mode="add" /></ProtectedRoute>} />
        <Route path="/admin/departments/edit/:id" element={<ProtectedRoute allowedRole="admin"><DepartmentForm mode="edit" /></ProtectedRoute>} />
        <Route path="/admin/departments/:id" element={<ProtectedRoute allowedRole="admin"><DepartmentDetail /></ProtectedRoute>} />
        <Route path="/admin/schedules" element={<ProtectedRoute allowedRole="admin"><ScheduleList /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRole="admin"><AdminAppointmentList /></ProtectedRoute>}/>
        <Route path="/admin/appointments/:id" element={ <ProtectedRoute allowedRole="admin"><AppointmentDetail /></ProtectedRoute>}/>


        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><AppointmentList /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><MyPatients /></ProtectedRoute>} />
        <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRole="doctor"><PatientDetail /></ProtectedRoute>} />
        <Route path="/doctor/schedules" element={<ProtectedRoute allowedRole="doctor"><MySchedules /></ProtectedRoute>} />

        <Route path="/patient/home" element={<ProtectedRoute allowedRole="patient"><PatientHome /></ProtectedRoute>} />
        <Route path="/patient/book-appointments" element={<ProtectedRoute allowedRole="patient"><AppointmentBooking /></ProtectedRoute>} />
        <Route path="/patient/view-my-appointments" element={<ProtectedRoute allowedRole="patient"><ViewAppointments /></ProtectedRoute>} />
        <Route path="/patient/support" element={<ProtectedRoute allowedRole="patient"><Support /></ProtectedRoute>} />
        <Route path="/patient/medical-records" element={<ProtectedRoute allowedRole="patient"><MedicalRecords /></ProtectedRoute>} />
        <Route path="/patient/view-doctor" element={<ProtectedRoute allowedRole="patient"><ViewDoctor /></ProtectedRoute>}/>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
