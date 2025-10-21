import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"

const router = express.Router()
router.use(authMiddleware)

const statusText = {
  0: "Booked",
  1: "Completed",
  2: "Cancelled",
  3: "DoctorCancelled",
  4: "Absent",
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await prisma.patientInfo.findUnique({ where: { userId } })
    if (!patient) return res.json([])
    const today = new Date()
    await prisma.appointment.updateMany({
      where: {
        patientId: patient.id,
        status: 0,
        schedule: { date: { lt: today } },
      },
      data: { status: 4 },
    })
    const list = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        schedule: {
          include: {
            doctor: { include: { user: true, specialty: true } },
            shift: true,
          },
        },
      },
      orderBy: { id: "desc" },
    })
    const result = list.map(a => ({
      id: a.id,
      doctorName: a.schedule.doctor.user.fullname,
      specialtyName: a.schedule.doctor.specialty?.name || "",
      date: a.schedule.date.toISOString().split("T")[0],
      shiftName: `Shift ${a.schedule.shift.id} (${new Date(a.schedule.shift.startTime).toISOString().slice(11,16)} - ${new Date(a.schedule.shift.endTime).toISOString().slice(11,16)})`,
      symptom: a.symptom || "",
      status: statusText[a.status] || "Unknown",
    }))
    res.json(result)
  } catch {
    res.status(500).json({ message: "Failed to load appointments." })
  }
})

router.post("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const patient = await prisma.patientInfo.findUnique({ where: { userId } })
    if (!patient) return res.status(404).json({ message: "Patient not found" })
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { schedule: true },
    })
    if (!appointment || appointment.patientId !== patient.id)
      return res.status(403).json({ message: "Unauthorized" })
    const today = new Date()
    if (appointment.schedule.date < today)
      return res.status(400).json({ message: "Cannot cancel past appointments" })
    await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status: 2 },
    })
    await prisma.workSchedule.update({
      where: { id: appointment.scheduleId },
      data: { status: 0 },
    })
    res.json({ message: "Appointment cancelled successfully" })
  } catch {
    res.status(500).json({ message: "Failed to cancel appointment." })
  }
})

router.get("/available-dates", async (req, res) => {
  try {
    const { doctorId } = req.query
    if (!doctorId) return res.status(400).json({ message: "doctorId required" })
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const rows = await prisma.workSchedule.findMany({
      where: {
        doctorId: Number(doctorId),
        status: 0,
        date: { gte: todayStart },
      },
      select: { date: true },
      orderBy: { date: "asc" },
    })
    const unique = [...new Set(rows.map(r => r.date.toISOString().split("T")[0]))]
    res.json(unique)
  } catch {
    res.status(500).json({ message: "Failed to load available dates." })
  }
})

router.get("/schedules", async (req, res) => {
  try {
    const { doctorId, date } = req.query
    if (!doctorId || !date)
      return res.status(400).json({ message: "doctorId and date required" })
    const start = new Date(`${date}T00:00:00`)
    const end = new Date(`${date}T23:59:59`)
    const schedules = await prisma.workSchedule.findMany({
      where: {
        doctorId: Number(doctorId),
        date: { gte: start, lte: end },
        status: 0,
      },
      include: { shift: true },
      orderBy: { shiftId: "asc" },
    })
    const formatted = schedules.map(s => {
      const st = new Date(s.shift.startTime).toISOString().slice(11, 16)
      const et = new Date(s.shift.endTime).toISOString().slice(11, 16)
      return { shiftId: s.shiftId, shiftName: `Shift ${s.shift.id} (${st} - ${et})` }
    })
    res.json(formatted)
  } catch {
    res.status(500).json({ message: "Failed to load schedules." })
  }
})

router.post("/", async (req, res) => {
  try {
    const { id: userId } = req.user
    const { doctorId, date, shiftId, symptom, request } = req.body
    if (!doctorId || !date || !shiftId || !symptom)
      return res.status(400).json({ message: "Missing required fields" })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ message: "User not found" })
    let patient = await prisma.patientInfo.findUnique({ where: { userId } })
    if (!patient) patient = await prisma.patientInfo.create({ data: { userId } })
    const start = new Date(`${date}T00:00:00`)
    const end = new Date(`${date}T23:59:59`)
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        doctorId: Number(doctorId),
        shiftId: Number(shiftId),
        status: 0,
        date: { gte: start, lte: end },
      },
    })
    if (!schedule)
      return res.status(404).json({ message: "Schedule not found" })
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        scheduleId: schedule.id,
        symptom,
        request,
      },
    })
    await prisma.workSchedule.update({
      where: { id: schedule.id },
      data: { status: 1 },
    })
    res.json({ message: "Appointment booked successfully" })
  } catch (err) {
    console.error("❌ Booking error:", err)
    res.status(500).json({ message: "Failed to book appointment." })
  }
})

export default router
