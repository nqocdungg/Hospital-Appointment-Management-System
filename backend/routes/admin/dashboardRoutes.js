import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/", async (req, res) => {
  try {
    const doctorCount = await prisma.doctorInfo.count()
    const patientCount = await prisma.patientInfo.count()
    const appointmentCount = await prisma.appointment.count()
    const specialtyCount = await prisma.specialty.count()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const appointmentsToday = await prisma.appointment.count({
      where: {
        schedule: {
          date: { gte: today, lt: tomorrow },
        },
      },
    })

    const monthlyRevenueResult = await prisma.doctorInfo.aggregate({
      _sum: { fee: true },
    })
    const monthlyRevenue = monthlyRevenueResult._sum.fee || 0

    const appointmentData = await prisma.$queryRaw`
      SELECT TO_CHAR(w."date", 'Mon') AS month, COUNT(a.id)::int AS appointments
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      GROUP BY month
      ORDER BY MIN(w."date");
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
      appointmentsToday,
      monthlyRevenue,
      specialties: specialtyCount,
      appointmentData,
      departmentData,
    })
  } catch (err) {
    console.error("Error fetching dashboard data:", err)
    res.status(500).json({ message: "Error loading dashboard" })
  }
})

export default router
