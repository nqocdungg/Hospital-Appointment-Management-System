import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireDoctor from "../../middleware/authDoctor.js"

const router = express.Router()
router.use(authMiddleware, requireDoctor)

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({
      where: { userId },
      select: { id: true }
    })
    if (!doctor) return res.status(403).json({ message: "Doctor not found" })
    const doctorInfoId = doctor.id

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const todayAppointments = await prisma.appointment.count({
      where: {
        schedule: { doctorId: doctorInfoId, date: { gte: today, lt: tomorrow } },
        status: { in: [0, 1] }
      }
    })

    const weeklyPatientsResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT a."patientId")::int AS total
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      WHERE w."doctorId" = ${doctorInfoId}
        AND a.status = 1
        AND w."date" >= ${sevenDaysAgo}
        AND w."date" < ${tomorrow};
    `
    const weeklyPatients = Number(weeklyPatientsResult[0]?.total || 0)

    const avgConsultTimeResult = await prisma.$queryRaw`
      SELECT COALESCE(AVG(
        (CAST(SPLIT_PART(s."endTime", ':', 1) AS int) * 60 + CAST(SPLIT_PART(s."endTime", ':', 2) AS int)) -
        (CAST(SPLIT_PART(s."startTime", ':', 1) AS int) * 60 + CAST(SPLIT_PART(s."startTime", ':', 2) AS int))
      ), 0)::int AS avg_minutes
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      JOIN "Shift" s ON w."shiftId" = s.id
      WHERE a.status = 1
        AND w."doctorId" = ${doctorInfoId};
    `
    const avgConsultTime = Number(avgConsultTimeResult[0]?.avg_minutes || 0)

    const pendingReportsResult = await prisma.$queryRaw`
      SELECT COUNT(a.id)::int AS total
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      WHERE w."doctorId" = ${doctorInfoId}
        AND a.status = 1
        AND NOT EXISTS (
          SELECT 1 FROM "MedicalRecord" m WHERE m."appointmentId" = a.id
        );
    `
    const pendingReports = Number(pendingReportsResult[0]?.total || 0)

    const appointmentTrend = await prisma.$queryRaw`
      SELECT TO_CHAR(w."date", 'YYYY-MM-DD') AS date, COUNT(a.id)::int AS count
      FROM "WorkSchedule" w
      LEFT JOIN "Appointment" a ON a."scheduleId" = w.id
      WHERE w."doctorId" = ${doctorInfoId}
        AND w."date" >= ${sevenDaysAgo}
        AND w."date" < ${tomorrow}
      GROUP BY w."date"
      ORDER BY w."date";
    `

    const patientStatsRaw = await prisma.$queryRaw`
      SELECT a.status, COUNT(a.id)::int AS value
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      WHERE w."doctorId" = ${doctorInfoId}
        AND w."date" >= ${startOfMonth}
        AND w."date" < ${nextMonth}
      GROUP BY a.status
      ORDER BY a.status;
    `
    const STATUS_MAP = {
      0: "BOOKED",
      1: "COMPLETED",
      2: "CANCELLED",
      3: "DOCTOR_CANCELLED",
      4: "ABSENT"
    }
    const allStatuses = Object.values(STATUS_MAP)
    const baseMap = new Map(allStatuses.map(s => [s, 0]))
    for (const row of patientStatsRaw) {
      const label = STATUS_MAP[row.status] || "UNKNOWN"
      baseMap.set(label, Number(row.value))
    }
    const patientStats = Array.from(baseMap.entries()).map(([status, value]) => ({ status, value }))

    res.json({
      todayAppointments,
      weeklyPatients,
      avgConsultTime,
      pendingReports,
      appointmentTrend,
      patientStats
    })
  } catch (err) {
    console.error("Error loading doctor dashboard:", err)
    res.status(500).json({ message: "Failed to load doctor dashboard data" })
  }
})

export default router
