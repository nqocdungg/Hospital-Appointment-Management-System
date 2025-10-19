import express from "express"
import prisma from "../../db.js"
import bcrypt from "bcryptjs"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/", async (_, res) => {
  try {
    const patients = await prisma.patientInfo.findMany({
      include: {
        user: { select: { fullname: true, email: true, phone: true, createdAt: true } },
      },
      orderBy: { id: "asc" },
    })
    res.json(patients)
  } catch {
    res.status(500).json({ error: "Cannot fetch patients" })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const patient = await prisma.patientInfo.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    })
    if (!patient) return res.status(404).json({ error: "Patient not found" })
    res.json(patient)
  } catch {
    res.status(500).json({ error: "Cannot fetch patient" })
  }
})

router.post("/", async (req, res) => {
  const { fullname, email, password, gender, dob, phone } = req.body
  try {
    const hashedPassword = bcrypt.hashSync(password, 8)
    const newPatient = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        phone,
        role: "PATIENT",
        patientInfo: { create: { gender, dob: dob ? new Date(dob) : null } },
      },
      include: { patientInfo: true },
    })
    res.status(201).json(newPatient)
  } catch {
    res.status(500).json({ error: "Cannot create patient" })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { fullname, email, gender, dob, phone } = req.body
  try {
    const updated = await prisma.patientInfo.update({
      where: { id: Number(id) },
      data: {
        gender,
        dob: dob ? new Date(dob) : null,
        user: { update: { fullname, email, phone } },
      },
      include: { user: true },
    })
    res.json(updated)
  } catch {
    res.status(500).json({ error: "Cannot update patient" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await prisma.patientInfo.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Cannot delete patient" })
  }
})

export default router
