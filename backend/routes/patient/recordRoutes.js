import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"

const router = express.Router()
router.use(authMiddleware)

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await prisma.patientInfo.findUnique({ where: { userId } })
    if (!patient) return res.json([])
    const records = await prisma.medicalRecord.findMany({
      where: { appointment: { patientId: patient.id } },
      include: {
        appointment: {
          include: {
            schedule: {
              include: { doctor: { include: { user: true } }, shift: true },
            },
          },
        },
      },
    })
    const formatted = records.map((r) => ({
      appointmentId: r.appointmentId,
      doctorName: r.appointment.schedule.doctor.user.fullname,
      date: r.appointment.schedule.date.toISOString().split("T")[0],
      shift: r.appointment.schedule.shift.period,
      diagnosis: r.diagnosis,
      prescription: r.prescription,
    }))
    res.json(formatted)
  } catch {
    res.status(500).json({ message: "Failed to load records." })
  }
})

export default router
