import express from 'express'
import cors from "cors"
import path, { dirname } from "path"
import { fileURLToPath } from 'url'
import adminDashboardRoutes from "./routes/admin/dashboardRoutes.js"
import adminDoctorRoutes from "./routes/admin/doctorRoutes.js"
import adminPatientRoutes from "./routes/admin/patientRoutes.js"
import adminDepartmentRoutes from "./routes/admin/departmentRoutes.js"
import adminScheduleRoutes from "./routes/admin/scheduleRoutes.js"
import authRoutes from "./routes/authRoutes.js"

const app = express()
const PORT = process.env.PORT || 5050

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/admin/doctors", adminDoctorRoutes)
app.use("/api/admin/patients", adminPatientRoutes)
app.use("/api/admin/departments", adminDepartmentRoutes)
app.use("/api/admin/schedules", adminScheduleRoutes)

app.use(express.static(path.join(__dirname, "../frontend/dist")))
app.get('*', (req, res) => {
    console.log("Serving react file: ", path.join(__dirname, "../frontend/dist/index.html"))
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});


app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`)
})

