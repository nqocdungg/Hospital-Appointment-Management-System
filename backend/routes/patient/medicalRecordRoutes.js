import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requirePatient from "../../middleware/authPatient.js"

const router = express.Router()
router.use(authMiddleware, requirePatient)

function fmtTime(v) {
  if (!v) return "-"
  return v.length === 5 ? v : v.slice(0, 5)
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id
    const patient = await prisma.patientInfo.findUnique({ where: { userId } })
    if (!patient) return res.status(404).json({ error: "Patient not found" })

    const rows = await prisma.medicalRecord.findMany({
      where: { appointment: { patientId: patient.id } },
      include: {
        appointment: {
          include: {
            schedule: {
              include: {
                doctor: { include: { user: true, specialty: true } },
                shift: true
              }
            }
          }
        }
      },
      orderBy: { appointment: { schedule: { date: "desc" } } }
    })

    const items = rows.map(r => {
      const a = r.appointment
      const s = a?.schedule
      return {
        appointmentId: a?.id || null,
        date: s?.date || null,
        time: s?.shift ? `${fmtTime(s.shift.startTime)} - ${fmtTime(s.shift.endTime)}` : "-",
        doctor: s?.doctor?.user?.fullname || "",
        specialty: s?.doctor?.specialty?.name || "",
        diagnosis: r.diagnosis || "",
        prescription: r.prescription || "",
        note: r.note || ""
      }
    })

    res.json({ total: items.length, items })
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch medical records" })
  }
})

router.get("/:appointmentId", async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId)
    const rec = await prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            schedule: {
              include: {
                doctor: { include: { user: true, specialty: true } },
                shift: true
              }
            }
          }
        }
      }
    })
    if (!rec) return res.json(null)

    const a = rec.appointment
    const s = a?.schedule
    const result = {
      appointmentId: a?.id || null,
      date: s?.date || null,
      time: s?.shift ? `${fmtTime(s.shift.startTime)} - ${fmtTime(s.shift.endTime)}` : "-",
      doctor: s?.doctor?.user?.fullname || "",
      specialty: s?.doctor?.specialty?.name || "",
      diagnosis: rec.diagnosis || "",
      prescription: rec.prescription || "",
      note: rec.note || ""
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch medical record detail" })
  }
})

export default router
