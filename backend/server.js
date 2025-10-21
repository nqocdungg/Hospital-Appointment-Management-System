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
import patientViewDoctorRoutes from "./routes/patient/viewdoctorRoutes.js"
import patientAppointmentRoutes from "./routes/patient/appointmentRoutes.js"
import patientRecordRoutes from "./routes/patient/recordRoutes.js"
import doctorAppointmentRoutes from "./routes/doctor/viewappointmentRoutes.js"

const app = express()
const PORT = process.env.PORT || 5050

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(express.json())

// Admin routes
app.use("/api/auth", authRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/admin/doctors", adminDoctorRoutes)
app.use("/api/admin/patients", adminPatientRoutes)
app.use("/api/admin/departments", adminDepartmentRoutes)
app.use("/api/admin/schedules", adminScheduleRoutes)

// Patient routes
app.use("/api/patient", patientViewDoctorRoutes)
app.use("/api/patient/appointments", patientAppointmentRoutes)
app.use("/api/patient/records", patientRecordRoutes)

// Doctor routes
app.use("/api/doctor/appointments", doctorAppointmentRoutes)

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")))
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
})

app.listen(PORT, () => {
  console.log(`✅ Server has started on port ${PORT}`)
})
