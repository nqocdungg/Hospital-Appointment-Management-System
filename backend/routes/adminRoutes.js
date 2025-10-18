import express from "express"
import prisma from "../db.js"
import bcrypt from "bcryptjs"
import authMiddleware from "../middleware/authMiddleware.js"
import requireAdmin from "../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware)
router.use(requireAdmin)

// Dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const doctorCount = await prisma.doctorInfo.count()
    const patientCount = await prisma.patientInfo.count()
    const appointmentCount = await prisma.appointment.count()
    const specialtyCount = await prisma.specialty.count()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const appointmentsToday = await prisma.appointment.count({
      where: {
        schedule: {
          date: { gte: today, lt: tomorrow },
        },
      },
    })

    const monthlyRevenueResult = await prisma.doctorInfo.aggregate({
      _sum: { fee: true },
    })
    const monthlyRevenue = monthlyRevenueResult._sum.fee || 0

    const appointmentData = await prisma.$queryRaw`
      SELECT TO_CHAR(w."date", 'Mon') AS month, COUNT(a.id)::int AS appointments
      FROM "Appointment" a
      JOIN "WorkSchedule" w ON a."scheduleId" = w.id
      GROUP BY month
      ORDER BY MIN(w."date");
    `

    const departmentData = await prisma.$queryRaw`
      SELECT s.name AS department, COUNT(a.id)::int AS value
      FROM "Specialty" s
      LEFT JOIN "DoctorInfo" d ON d."specialtyId" = s.id
      LEFT JOIN "WorkSchedule" w ON w."doctorId" = d.id
      LEFT JOIN "Appointment" a ON a."scheduleId" = w.id
      GROUP BY s.name
      ORDER BY s.name;
    `

    res.json({
      doctors: doctorCount,
      patients: patientCount,
      appointmentsToday,
      monthlyRevenue,
      specialties: specialtyCount,
      appointmentData,
      departmentData,
    })
  } catch (err) {
    console.error("Error fetching dashboard data:", err)
    res.status(500).json({ message: "Error loading dashboard" })
  }
})

// Doctor Management
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.doctorInfo.findMany({
      include: {
        user: { select: { fullname: true, email: true, phone: true, createdAt: true } },
        specialty: { select: { id: true, name: true } },
      },
      orderBy: { id: "asc" },
    })
    res.json(doctors)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot fetch doctors" })
  }
})

router.post("/doctors", async (req, res) => {
  const { fullname, email, password, gender, qualification, fee, specialtyId, phone } = req.body
  try {
    const hashedPassword = bcrypt.hashSync(password, 8)
    const doctor = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        phone,
        role: "DOCTOR",
        doctorInfo: {
          create: { gender, qualification, fee, specialtyId },
        },
      },
      include: { doctorInfo: true },
    })
    res.status(201).json(doctor)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot create doctor" })
  }
})

router.put("/doctors/:id", async (req, res) => {
  const { id } = req.params
  const { fullname, email, gender, qualification, fee, specialtyId, phone } = req.body
  try {
    const updated = await prisma.doctorInfo.update({
      where: { id: Number(id) },
      data: {
        gender,
        qualification,
        fee,
        specialtyId,
        user: { update: { fullname, email, phone } },
      },
      include: { user: true, specialty: true },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot update doctor" })
  }
})

router.delete("/doctors/:id", async (req, res) => {
  const { id } = req.params
  try {
    await prisma.doctorInfo.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Cannot delete doctor" })
  }
})

router.get("/departments", async (req, res) => {
  const list = await prisma.specialty.findMany({ orderBy: { name: "asc" } })
  res.json(list)
})

// Patient Management
router.get("/patients", async (req, res) => {
  try {
    const patients = await prisma.patientInfo.findMany({
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: "asc" },
    })
    res.json(patients)
  } catch (err) {
    console.error("Error fetching patients:", err)
    res.status(500).json({ error: "Cannot fetch patients" })
  }
})

router.get("/patients/:id", async (req, res) => {
  const { id } = req.params
  try {
    const patient = await prisma.patientInfo.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    })
    if (!patient) return res.status(404).json({ error: "Patient not found" })
    res.json(patient)
  } catch (err) {
    console.error("Error fetching patient:", err)
    res.status(500).json({ error: "Cannot fetch patient" })
  }
})

router.post("/patients", async (req, res) => {
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
        patientInfo: {
          create: { gender, dob: dob ? new Date(dob) : null },
        },
      },
      include: { patientInfo: true },
    })
    res.status(201).json(newPatient)
  } catch (err) {
    console.error("Error adding patient:", err)
    res.status(500).json({ error: "Cannot create patient" })
  }
})

router.put("/patients/:id", async (req, res) => {
  const { id } = req.params
  const { fullname, email, gender, dob, phone } = req.body
  try {
    const updated = await prisma.patientInfo.update({
      where: { id: Number(id) },
      data: {
        gender,
        dob: dob ? new Date(dob) : null,
        user: {
          update: {
            fullname,
            email,
            phone,
          },
        },
      },
      include: { user: true },
    })
    res.json(updated)
  } catch (err) {
    console.error("Error updating patient:", err)
    res.status(500).json({ error: "Cannot update patient" })
  }
})

router.delete("/patients/:id", async (req, res) => {
  const { id } = req.params
  try {
    await prisma.patientInfo.delete({
      where: { id: Number(id) },
    })
    res.json({ success: true })
  } catch (err) {
    console.error("Error deleting patient:", err)
    res.status(500).json({ error: "Cannot delete patient" })
  }
})

//specialties
router.get("/departments", async (req, res) => {
  try {
    const list = await prisma.specialty.findMany({
      orderBy: { id: "asc" },
    })
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to load departments." })
  }
})

router.get("/departments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const specialty = await prisma.specialty.findUnique({
      where: { id },
      include: {
        doctors: {
          include: {
            user: true,
          },
        },
      },
    })
    if (!specialty) return res.status(404).json({ message: "Not found." })
    res.json(specialty)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to load department detail." })
  }
})

router.post("/departments", async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name?.trim()) return res.status(400).json({ message: "Name is required." })
    const created = await prisma.specialty.create({
      data: { name: name.trim(), description },
    })
    res.status(201).json(created)
  } catch (err) {
    console.error(err)
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Department name already exists." })
    }
    res.status(500).json({ message: "Failed to create department." })
  }
})

router.put("/departments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, description } = req.body
    const updated = await prisma.specialty.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description ? { description } : {}),
      },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Department not found." })
    }
    res.status(500).json({ message: "Failed to update department." })
  }
})

router.delete("/departments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)

    const count = await prisma.doctorInfo.count({ where: { specialtyId: id } })
    if (count > 0)
      return res.status(400).json({
        message: "Cannot delete department with assigned doctors.",
      })

    await prisma.specialty.delete({ where: { id } })
    res.json({ message: "Department deleted successfully." })
  } catch (err) {
    console.error(err)
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Department not found." })
    }
    res.status(500).json({ message: "Failed to delete department." })
  }
})
export default router
