import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireDoctor from "../../middleware/authDoctor.js"

const router = express.Router()
router.use(authMiddleware, requireDoctor)

function fmtTime(v) {
  return typeof v === "string" ? v : ""
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({ where: { userId } })
    const doctorId = doctor?.id
    if (!doctorId) return res.status(404).json({ error: "Doctor not found" })
    const { q = "" } = req.query
    const appts = await prisma.appointment.findMany({
      where: { status: 1, schedule: { doctorId } },
      include: { schedule: true, patient: { include: { user: true } } },
      orderBy: { schedule: { date: "desc" } },
    })
    const map = new Map()
    for (const a of appts) {
      const pid = a.patientId
      if (!map.has(pid)) {
        map.set(pid, {
          patientId: pid,
          fullname: a.patient.user.fullname,
          phone: a.patient.user.phone || "",
          gender: a.patient.gender || null,
          lastAppointment: a.schedule.date,
          totalVisits: 1,
        })
      } else {
        const cur = map.get(pid)
        cur.totalVisits += 1
      }
    }
    let items = Array.from(map.values())
    if (q) {
      const qq = q.toLowerCase()
      items = items.filter(it => (it.fullname || "").toLowerCase().includes(qq) || (it.phone || "").includes(q))
    }
    res.json({ total: items.length, items })
  } catch {
    res.status(500).json({ error: "Cannot fetch patients" })
  }
})

router.get("/:patientId", async (req, res) => {
  try {
    const userId = req.user.id
    const doctor = await prisma.doctorInfo.findUnique({ where: { userId } })
    const doctorId = doctor?.id
    if (!doctorId) return res.status(404).json({ error: "Doctor not found" })
    const patientId = Number(req.params.patientId)
    const patient = await prisma.patientInfo.findUnique({
      where: { id: patientId },
      include: { user: true },
    })
    if (!patient) return res.status(404).json({ error: "Patient not found" })
    const appts = await prisma.appointment.findMany({
      where: { patientId, schedule: { doctorId }, status: 1 },
      include: { schedule: { include: { shift: true } }, record: true },
      orderBy: { schedule: { date: "desc" } },
    })
    const history = appts.map(a => ({
      appointmentId: a.id,
      date: a.schedule.date,
      time: a.schedule.shift ? `${fmtTime(a.schedule.shift.startTime)} - ${fmtTime(a.schedule.shift.endTime)}` : "-",
      diagnosis: a.record?.diagnosis || "",
      prescription: a.record?.prescription || "",
      note: a.record?.note || "",
    }))
    res.json({
      patient: {
        id: patient.id,
        fullname: patient.user.fullname,
        phone: patient.user.phone || "",
        gender: patient.gender || null,
        dob: patient.dob || null,
      },
      history,
    })
  } catch {
    res.status(500).json({ error: "Cannot fetch patient detail" })
  }
})

export default router
