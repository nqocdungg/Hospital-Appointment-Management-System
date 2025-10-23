import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireDoctor from "../../middleware/authDoctor.js"

const router = express.Router()
router.use(authMiddleware, requireDoctor)

router.get("/:appointmentId", async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId)
    const record = await prisma.medicalRecord.findUnique({ where: { appointmentId } })
    res.json(record || null)
  } catch {
    res.status(500).json({ error: "Cannot fetch medical record" })
  }
})

router.post("/:appointmentId", async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId)
    const { diagnosis, prescription, note } = req.body
    const exists = await prisma.medicalRecord.findUnique({ where: { appointmentId } })
    const record = exists
      ? await prisma.medicalRecord.update({ where: { appointmentId }, data: { diagnosis, prescription, note } })
      : await prisma.medicalRecord.create({ data: { appointmentId, diagnosis, prescription, note } })
    res.json(record)
  } catch {
    res.status(500).json({ error: "Cannot save medical record" })
  }
})

router.patch("/:appointmentId", async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId)
    const { diagnosis, prescription, note } = req.body
    const record = await prisma.medicalRecord.update({ where: { appointmentId }, data: { diagnosis, prescription, note } })
    res.json(record)
  } catch {
    res.status(500).json({ error: "Cannot update medical record" })
  }
})

export default router
