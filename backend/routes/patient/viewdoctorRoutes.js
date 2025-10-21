import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"

const router = express.Router()
router.use(authMiddleware)

router.get("/specialties", async (req, res) => {
  try {
    const list = await prisma.specialty.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true, description: true },
    })
    res.json(list)
  } catch {
    res.status(500).json({ message: "Failed to load specialties." })
  }
})

router.get("/doctors", async (req, res) => {
  try {
    const { specialtyId } = req.query
    if (!specialtyId) return res.status(400).json({ message: "specialtyId required" })
    const doctors = await prisma.doctorInfo.findMany({
      where: { specialtyId: Number(specialtyId) },
      include: { user: { select: { id: true, fullname: true, email: true } } },
      orderBy: { id: "asc" },
    })
    const formatted = doctors.map((d) => ({
      id: d.id,
      fullname: d.user.fullname,
      email: d.user.email,
    }))
    res.json(formatted)
  } catch {
    res.status(500).json({ message: "Failed to load doctors." })
  }
})

export default router
