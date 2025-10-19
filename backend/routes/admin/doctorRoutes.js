import express from "express"
import prisma from "../../db.js"
import bcrypt from "bcryptjs"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

// ✅ Lấy danh sách bác sĩ (có thể lọc theo chuyên khoa và tìm theo tên)
router.get("/", async (req, res) => {
  try {
    const { specialtyId, q } = req.query

    const where = {
      ...(specialtyId ? { specialtyId: Number(specialtyId) } : {}),
      ...(q
        ? { user: { fullname: { contains: String(q), mode: "insensitive" } } }
        : {}),
    }

    const doctors = await prisma.doctorInfo.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
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

// ✅ Thêm bác sĩ mới
router.post("/", async (req, res) => {
  try {
    const { fullname, email, password, gender, qualification, fee, specialtyId, phone } = req.body

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "Email already exists" })
    }

    const hashedPassword = bcrypt.hashSync(password, 8)
    const doctor = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        phone,
        role: "DOCTOR",
        doctorInfo: {
          create: { gender, qualification, fee: Number(fee) || 0, specialtyId: Number(specialtyId) || null },
        },
      },
      include: {
        doctorInfo: { include: { specialty: true } },
      },
    })

    res.status(201).json(doctor)
  } catch (err) {
    console.error("Error creating doctor:", err)
    res.status(500).json({ error: "Cannot create doctor" })
  }
})

// ✅ Cập nhật thông tin bác sĩ
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { fullname, email, gender, qualification, fee, specialtyId, phone } = req.body

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
        specialtyId: Number(specialtyId) || null,
        user: {
          update: {
            fullname,
            email,
            phone,
          },
        },
      },
      include: { user: true, specialty: true },
    })

    res.json(updated)
  } catch (err) {
    console.error("Error updating doctor:", err)
    res.status(500).json({ error: "Cannot update doctor" })
  }
})

// ✅ Xóa bác sĩ (xóa cả user liên quan)
router.delete("/:id", async (req, res) => {
  try {
    const doc = await prisma.doctorInfo.findUnique({
      where: { id: Number(req.params.id) },
    })
    if (!doc) return res.status(404).json({ error: "Doctor not found" })

    await prisma.user.delete({ where: { id: doc.userId } })
    res.json({ success: true })
  } catch (err) {
    console.error("Error deleting doctor:", err)
    res.status(500).json({ error: "Cannot delete doctor" })
  }
})

// ✅ Lấy chi tiết 1 bác sĩ (phục vụ trang /admin/doctors/:id)
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
