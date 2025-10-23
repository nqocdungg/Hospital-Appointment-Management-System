import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/", async (req, res) => {
  try {
    const [doctorCount, patientCount, specialtyCount, appointmentCount] = await Promise.all([
      prisma.doctorInfo.count(),
      prisma.patientInfo.count(),
      prisma.specialty.count(),
      prisma.appointment.count()
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const appointmentsToday = await prisma.appointment.count({
      where: {
        schedule: { date: { gte: today, lt: tomorrow } }
      }
    })

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const monthlyRevenueResult = await prisma.$queryRaw`
      SELECT COALESCE(SUM(d."fee"), 0)::int AS total
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      JOIN "DoctorInfo" d ON w."doctorId" = d.id
      WHERE a.status = 1
        AND w."date" >= ${firstDay}
        AND w."date" < ${nextMonth};
    `
    const monthlyRevenue = Number(monthlyRevenueResult[0]?.total || 0)

    const appointmentData = await prisma.$queryRaw`
      SELECT TO_CHAR(w."date", 'Mon') AS month, COUNT(a.id)::int AS appointments
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      WHERE EXTRACT(YEAR FROM w."date") = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY month, EXTRACT(MONTH FROM w."date")
      ORDER BY EXTRACT(MONTH FROM w."date");
    `
    const departmentData = await prisma.$queryRaw`
      SELECT s.name AS department, COUNT(a.id)::int AS value
      FROM "Specialty" s
      LEFT JOIN "DoctorInfo" d ON d."specialtyId" = s.id
      LEFT JOIN "WorkSchedule" w ON w."doctorId" = d.id
      LEFT JOIN "Appointment" a ON a."scheduleId" = w.id
      GROUP BY s.name
      ORDER BY s.name;
    `

    res.json({
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      appointmentsToday,
      monthlyRevenue,
      specialties: specialtyCount,
      appointmentData,
      departmentData
    })
  } catch (err) {
    console.error("Error fetching admin dashboard:", err)
    res.status(500).json({ message: "Error loading dashboard data" })
  }
})

export default router
