import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/", async (req, res) => {
  try {
    const { q = "", doctorId = "", status = "", dateFrom = "", dateTo = "", sort = "asc" } = req.query
    const scheduleFilter = {}
    if (doctorId) scheduleFilter.doctorId = Number(doctorId)
    if (dateFrom || dateTo) {
      scheduleFilter.date = {}
      if (dateFrom) scheduleFilter.date.gte = dateFrom
      if (dateTo) scheduleFilter.date.lte = dateTo
    }

    const where = {
      ...(status !== "" ? { status: Number(status) } : {}),
      ...(Object.keys(scheduleFilter).length > 0 ? { schedule: { is: scheduleFilter } } : {}),
      ...(q
        ? {
            OR: [
              { patient: { user: { fullname: { contains: q, mode: "insensitive" } } } },
              { schedule: { doctor: { user: { fullname: { contains: q, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    }

    const rows = await prisma.appointment.findMany({
      where,
      include: {
        schedule: {
          include: {
            shift: true,
            doctor: { include: { user: true } },
          },
        },
        patient: { include: { user: true } },
      },
      orderBy: [{ schedule: { date: sort === "desc" ? "desc" : "asc" } }],
    })

    const items = rows.map(r => ({
      id: r.id,
      date: r.schedule.date,
      status: r.status,
      shift: { startTime: r.schedule.shift.startTime, endTime: r.schedule.shift.endTime },
      doctorName: r.schedule.doctor.user.fullname,
      patientName: r.patient.user.fullname,
    }))

    res.json(items)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot fetch appointments" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        schedule: {
          include: {
            shift: true,
            doctor: { include: { user: true, specialty: true } },
          },
        },
        patient: { include: { user: true } },
        record: true,
      },
    })
    if (!appt) return res.status(404).json({ error: "Appointment not found" })
    res.json({
      id: appt.id,
      date: appt.schedule.date,
      status: appt.status,
      symptom: appt.symptom,
      request: appt.request,
      note: appt.note,
      shift: { startTime: appt.schedule.shift.startTime, endTime: appt.schedule.shift.endTime },
      doctor: {
        id: appt.schedule.doctor.id,
        fullname: appt.schedule.doctor.user.fullname,
        specialtyName: appt.schedule.doctor.specialty?.name || "",
        phone: appt.schedule.doctor.user.phone || "",
        fee: appt.schedule.doctor.fee || null,
      },
      patient: {
        id: appt.patient.id,
        fullname: appt.patient.user.fullname,
        gender: appt.patient.gender,
        dob: appt.patient.dob,
        phone: appt.patient.user.phone || "",
        email: appt.patient.user.email || "",
      },
      record: appt.record
        ? {
            diagnosis: appt.record.diagnosis,
            prescription: appt.record.prescription,
            note: appt.record.note,
          }
        : null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot fetch appointment detail" })
  }
})

export default router
