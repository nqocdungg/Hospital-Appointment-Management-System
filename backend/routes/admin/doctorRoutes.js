import express from "express"
import prisma from "../../db.js"
import bcrypt from "bcryptjs"
import multer from "multer"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

const storage = multer.diskStorage({
  destination: "public/uploads/doctors",
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop()
    cb(null, `doctor_${Date.now()}.${ext}`)
  },
})
const upload = multer({ storage })

router.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" })
  res.json({ path: `/uploads/doctors/${req.file.filename}` })
})

router.get("/", async (req, res) => {
  try {
    const { specialtyId, q } = req.query
    const where = {
      ...(specialtyId ? { specialtyId: Number(specialtyId) } : {}),
      ...(q ? { user: { fullname: { contains: String(q), mode: "insensitive" } } } : {}),
    }
    const doctors = await prisma.doctorInfo.findMany({
      where,
      include: {
        user: { select: { id: true, fullname: true, email: true, phone: true, createdAt: true } },
        specialty: { select: { id: true, name: true } },
      },
      orderBy: { id: "asc" },
    })
    res.json(doctors)
  } catch (err) {
    console.error("Error fetching doctors:", err)
    res.status(500).json({ error: "Cannot fetch doctors" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { fullname, email, password, gender, qualification, fee, specialtyId, phone, photo } = req.body
    if (!fullname || !email || !password) return res.status(400).json({ error: "Missing required fields" })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: "Email already exists" })
    const hashedPassword = bcrypt.hashSync(password, 8)
    const doctor = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        phone,
        role: "DOCTOR",
        doctorInfo: {
          create: {
            gender,
            qualification,
            fee: Number(fee) || 0,
            specialtyId: Number(specialtyId) || null,
            photo,
          },
        },
      },
      include: { doctorInfo: { include: { specialty: true } } },
    })
    res.status(201).json(doctor)
  } catch (err) {
    console.error("Error creating doctor:", err)
    res.status(500).json({ error: "Cannot create doctor" })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { fullname, email, gender, qualification, fee, specialtyId, phone, photo } = req.body
    const doctor = await prisma.doctorInfo.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    })
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    const updated = await prisma.doctorInfo.update({
      where: { id: Number(id) },
      data: {
        gender,
        qualification,
        fee: Number(fee) || 0,
        photo,
        specialty: specialtyId
          ? { connect: { id: Number(specialtyId) } }
          : { disconnect: true },
        user: { update: { fullname, email, phone } },
      },
      include: { user: true, specialty: true },
    })
    res.json(updated)
  } catch (err) {
    console.error("Error updating doctor:", err)
    res.status(500).json({ error: "Cannot update doctor" })
  }
})


router.delete("/:id", async (req, res) => {
  try {
    const doc = await prisma.doctorInfo.findUnique({ where: { id: Number(req.params.id) } })
    if (!doc) return res.status(404).json({ error: "Doctor not found" })
    await prisma.user.delete({ where: { id: doc.userId } })
    res.json({ success: true })
  } catch (err) {
    console.error("Error deleting doctor:", err)
    res.status(500).json({ error: "Cannot delete doctor" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const doctor = await prisma.doctorInfo.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, specialty: true },
    })
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    res.json(doctor)
  } catch (err) {
    console.error("Error fetching doctor:", err)
    res.status(500).json({ error: "Cannot fetch doctor detail" })
  }
})

export default router
