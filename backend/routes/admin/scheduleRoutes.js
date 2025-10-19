import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/shifts", async (_req, res) => {
  try {
    const shifts = await prisma.shift.findMany({ orderBy: { id: "asc" } })
    const formatted = shifts.map((s, i) => ({
      id: s.id,
      period: s.period,
      slot: i + 1,
      start: toHHmm(s.startTime),
      end: toHHmm(s.endTime),
      label: `Shift ${i + 1} (${toHHmm(s.startTime)}-${toHHmm(s.endTime)})`,
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shifts" })
  }
})

router.get("/", async (req, res) => {
  try {
    const { q, specialtyId, dateFrom, dateTo, status, sort } = req.query
    const where = {
      ...(status !== undefined && status !== "" ? { status: Number(status) } : {}),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
      ...(specialtyId ? { doctor: { specialtyId: Number(specialtyId) } } : {}),
      ...(q ? { doctor: { user: { fullname: { contains: String(q), mode: "insensitive" } } } } : {}),
    }

    const schedules = await prisma.workSchedule.findMany({
      where,
      include: {
        doctor: { include: { user: true, specialty: true } },
        shift: true,
      },
      orderBy: [
        { date: "asc" },
        { shift: { startTime: sort === "desc" ? "desc" : "asc" } },
      ],
    })

    const formatted = schedules.map((s) => ({
      id: s.id,
      doctorId: s.doctorId,
      doctor: s.doctor.user.fullname,
      specialtyId: s.doctor.specialty?.id ?? null,
      specialty: s.doctor.specialty?.name ?? "N/A",
      date: s.date.toISOString().split("T")[0],
      shift: s.shift.period,
      start_time: toHHmm(s.shift.startTime),
      end_time: toHHmm(s.shift.endTime),
      status: s.status,
      statusText: s.status === 0 ? "Free" : s.status === 1 ? "Busy" : "Off",
    }))

    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedules" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const schedule = await prisma.workSchedule.findUnique({
      where: { id: Number(req.params.id) },
      include: { doctor: { include: { user: true, specialty: true } }, shift: true },
    })
    if (!schedule) return res.status(404).json({ error: "Schedule not found" })
    res.json(schedule)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedule" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { doctorId, date, shiftId } = req.body
    if (!doctorId || !date || !shiftId) return res.status(400).json({ error: "Missing fields" })
    const existed = await prisma.workSchedule.findFirst({
      where: { doctorId: Number(doctorId), date: new Date(date), shiftId: Number(shiftId) },
    })
    if (existed) return res.status(409).json({ error: "This schedule already exists" })
    const created = await prisma.workSchedule.create({
      data: { doctorId: Number(doctorId), date: new Date(date), shiftId: Number(shiftId) },
    })
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: "Failed to create schedule" })
  }
})

router.post("/bulk", async (req, res) => {
  try {
    const { doctorId, date, shiftIds } = req.body
    if (!doctorId || !date || !Array.isArray(shiftIds) || shiftIds.length === 0)
      return res.status(400).json({ error: "Missing fields" })
    const existing = await prisma.workSchedule.findMany({
      where: { doctorId: Number(doctorId), date: new Date(date), shiftId: { in: shiftIds.map(Number) } },
    })
    const existingIds = new Set(existing.map((e) => e.shiftId))
    const toInsert = shiftIds
      .map(Number)
      .filter((sid) => !existingIds.has(sid))
      .map((sid) => ({ doctorId: Number(doctorId), date: new Date(date), shiftId: sid }))
    if (toInsert.length === 0)
      return res.status(200).json({ inserted: 0, message: "All selected shifts already exist." })
    const created = await prisma.workSchedule.createMany({ data: toInsert })
    res.status(201).json({ inserted: created.count })
  } catch (err) {
    res.status(500).json({ error: "Failed to create schedules" })
  }
})

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body
    const updated = await prisma.workSchedule.update({
      where: { id: Number(req.params.id) },
      data: { status: Number(status) },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await prisma.workSchedule.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete schedule" })
  }
})

export default router

function toHHmm(d) {
  const dt = new Date(d)
  const hh = String(dt.getUTCHours()).padStart(2, "0")
  const mm = String(dt.getUTCMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}
