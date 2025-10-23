import express from "express"
import cors from "cors"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import prisma from "./db.js"
import adminDashboardRoutes from "./routes/admin/dashboardRoutes.js"
import adminDoctorRoutes from "./routes/admin/doctorRoutes.js"
import adminPatientRoutes from "./routes/admin/patientRoutes.js"
import adminDepartmentRoutes from "./routes/admin/departmentRoutes.js"
import adminScheduleRoutes from "./routes/admin/scheduleRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import patientAppointmentRoutes from "./routes/patient/appointmentRoutes.js"
import patientMedicalRecordRoutes from "./routes/patient/medicalRecordRoutes.js"
import doctorAppointmentRoutes from "./routes/doctor/viewappointmentRoutes.js"
import doctorMedicalRecordRoutes from "./routes/doctor/medicalRecordRoutes.js"
import doctorPatientRoutes from "./routes/doctor/patientRoutes.js"
import doctorScheduleRoutes from "./routes/doctor/doctorScheduleRoutes.js"
import adminAppointmentRoutes from "./routes/admin/appointmentRoutes.js"
import viewDoctorRoutes from "./routes/patient/viewDoctorRoutes.js"
import doctorDashboardRoutes from "./routes/doctor/dashboardRoutes.js"

const app = express()
const PORT = process.env.PORT || 5050

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/admin/doctors", adminDoctorRoutes)
app.use("/api/admin/patients", adminPatientRoutes)
app.use("/api/admin/departments", adminDepartmentRoutes)
app.use("/api/admin/schedules", adminScheduleRoutes)
app.use("/api/admin/appointments", adminAppointmentRoutes)

app.use("/api/patient/appointments", patientAppointmentRoutes)
app.use("/api/patient/medical-records", patientMedicalRecordRoutes)
app.use("/api/patient/view-doctor", viewDoctorRoutes)

app.use("/api/doctor/appointments", doctorAppointmentRoutes)
app.use("/api/doctor/medical-records", doctorMedicalRecordRoutes)
app.use("/api/doctor/patients", doctorPatientRoutes)
app.use("/api/doctor/schedules", doctorScheduleRoutes)
app.use("/api/doctor/dashboard", doctorDashboardRoutes)

app.use(express.static(path.join(__dirname, "../frontend/dist")))
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`)
})
