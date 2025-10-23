import express from "express"
import { PrismaClient } from "@prisma/client"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireDoctor from "../../middleware/authDoctor.js"

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware, requireDoctor)

router.get("/", async (req, res) => {
  try {
    const doctor = await prisma.doctorInfo.findUnique({
      where: { userId: req.user.id },
    })
    if (!doctor) return res.status(404).json({ error: "Doctor not found." })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const schedules = await prisma.workSchedule.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: today },
      },
      include: {
        shift: true,
        doctor: { include: { specialty: true } },
      },
      orderBy: [{ date: "asc" }, { shiftId: "asc" }],
    })

    const items = schedules.map((s) => ({
      id: s.id,
      date: s.date ? new Date(s.date).toISOString() : null,
      status: s.status,
      shift: {
        id: s.shift.id,
        startTime: s.shift.startTime,
        endTime: s.shift.endTime,
        period: s.shift.period,
      },
      doctor: {
        id: s.doctor.id,
        specialty: s.doctor.specialty?.name || null,
        fee: s.doctor.fee || null,
      },
    }))

    res.json(items)
  } catch {
    res.status(500).json({ error: "Failed to load schedules." })
  }
})

router.put("/:id/off", async (req, res) => {
  try {
    const doctor = await prisma.doctorInfo.findUnique({
      where: { userId: req.user.id },
    })
    if (!doctor) return res.status(404).json({ error: "Doctor not found." })

    const id = parseInt(req.params.id)
    const schedule = await prisma.workSchedule.findFirst({
      where: { id, doctorId: doctor.id },
    })
    if (!schedule) return res.status(404).json({ error: "Schedule not found." })

    await prisma.$transaction([
      prisma.workSchedule.update({
        where: { id },
        data: { status: 2 },
      }),
      prisma.appointment.updateMany({
        where: { scheduleId: id, status: { in: [0, 1] } },
        data: { status: 3 },
      }),
    ])

    res.json({ message: "Marked as off successfully." })
  } catch {
    res.status(500).json({ error: "Failed to update schedule." })
  }
})

export default router
