import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireDoctor from "../../middleware/authDoctor.js"

const router = express.Router()
router.use(authMiddleware, requireDoctor)

function fmtTime(v) {
  const d = new Date(v)
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`
}

const STATUS_MAP = {
  0: "BOOKED",
  1: "COMPLETED",
  2: "CANCELLED",
  3: "DOCTOR_CANCELLED",
  4: "ABSENT",
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({ where: { userId } })
    const doctorId = doctor?.id
    if (!doctorId) return res.status(404).json({ error: "Doctor not found" })
    const { q = "", status = "", dateFrom = "", dateTo = "", sort = "asc" } = req.query
    const where = {
      schedule: {
        doctorId,
        ...(dateFrom || dateTo ? { date: { gte: dateFrom ? new Date(dateFrom) : undefined, lte: dateTo ? new Date(dateTo) : undefined } } : {}),
      },
      ...(status !== "" ? { status: Number(status) } : {}),
      ...(q ? { patient: { user: { fullname: { contains: q, mode: "insensitive" } } } } : {}),
    }
    const rows = await prisma.appointment.findMany({
      where,
      include: { schedule: { include: { shift: true } }, patient: { include: { user: true } } },
      orderBy: [{ schedule: { date: sort === "desc" ? "desc" : "asc" } }],
    })
    const items = rows.map(r => ({
      id: r.id,
      date: r.schedule.date,
      shift: { startTime: fmtTime(r.schedule.shift.startTime), endTime: fmtTime(r.schedule.shift.endTime) },
      patient: { fullname: r.patient.user.fullname, phone: r.patient.user.phone || "" },
      status: STATUS_MAP[r.status] ?? "UNKNOWN",
      reason: r.symptom || r.request || "",
    }))
    res.json({ total: items.length, items })
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch appointments" })
  }
})

router.get("/records/:patientId", async (req, res) => {
  try {
    const patientId = Number(req.params.patientId)
    const appts = await prisma.appointment.findMany({
      where: { patientId },
      include: { record: true, schedule: true },
      orderBy: { schedule: { date: "desc" } },
    })
    const records = appts.filter(a => a.record).map(a => ({
      appointmentDate: a.schedule?.date ?? null,
      diagnosis: a.record?.diagnosis ?? "",
      prescription: a.record?.prescription ?? "",
      note: a.record?.note ?? "",
    }))
    res.json(records)
  } catch (err) {
    res.status(500).json([])
  }
})

router.get("/:id", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({ where: { userId } })
    const doctorId = doctor?.id
    if (!doctorId) return res.status(404).json({ error: "Doctor not found" })
    const appt = await prisma.appointment.findFirst({
      where: { id: Number(req.params.id), schedule: { doctorId } },
      include: { schedule: { include: { shift: true } }, patient: { include: { user: true } } },
    })
    if (!appt) return res.status(404).json({ error: "Appointment not found" })
    res.json({
      id: appt.id,
      date: appt.schedule.date,
      status: STATUS_MAP[appt.status] ?? "UNKNOWN",
      note: appt.note || "",
      symptom: appt.symptom || "",
      request: appt.request || "",
      shift: { startTime: fmtTime(appt.schedule.shift.startTime), endTime: fmtTime(appt.schedule.shift.endTime) },
      patient: {
        id: appt.patient.id,
        fullname: appt.patient.user.fullname,
        gender: appt.patient.gender || null,
        dob: appt.patient.dob || null,
        phone: appt.patient.user.phone || "",
      },
    })
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch appointment detail" })
  }
})

router.patch("/:id/status", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({ where: { userId } })
    const doctorId = doctor?.id
    if (!doctorId) return res.status(404).json({ error: "Doctor not found" })
    const { status, note } = req.body
    const found = await prisma.appointment.findFirst({ where: { id: Number(req.params.id), schedule: { doctorId } } })
    if (!found) return res.status(404).json({ error: "Appointment not found" })
    const updated = await prisma.appointment.update({ where: { id: found.id }, data: { status: Number(status), note: note ?? found.note } })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: "Cannot update status" })
  }
})

export default router
