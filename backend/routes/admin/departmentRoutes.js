// backend/routes/admin/departmentRoutes.js
import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"
import requireAdmin from "../../middleware/authAdmin.js"

const router = express.Router()
router.use(authMiddleware, requireAdmin)

router.get("/", async (_, res) => {
  try {
    const list = await prisma.specialty.findMany({ orderBy: { id: "asc" } })
    res.json(list)
  } catch {
    res.status(500).json({ message: "Failed to load departments." })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const specialty = await prisma.specialty.findUnique({
      where: { id: Number(req.params.id) },
      include: { doctors: { include: { user: true } } },
    })
    if (!specialty) return res.status(404).json({ message: "Not found." })
    res.json(specialty)
  } catch {
    res.status(500).json({ message: "Failed to load department detail." })
  }
})

router.post("/", async (req, res) => {
  const { name, description } = req.body
  try {
    if (!name?.trim()) return res.status(400).json({ message: "Name is required." })
    const created = await prisma.specialty.create({ data: { name: name.trim(), description } })
    res.status(201).json(created)
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Department name already exists." })
    res.status(500).json({ message: "Failed to create department." })
  }
})

router.put("/:id", async (req, res) => {
  const { name, description } = req.body
  try {
    const updated = await prisma.specialty.update({
      where: { id: Number(req.params.id) },
      data: { ...(name ? { name: name.trim() } : {}), ...(description ? { description } : {}) },
    })
    res.json(updated)
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Department not found." })
    res.status(500).json({ message: "Failed to update department." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const count = await prisma.doctorInfo.count({ where: { specialtyId: id } })
    if (count > 0)
      return res.status(400).json({ message: "Cannot delete department with assigned doctors." })
    await prisma.specialty.delete({ where: { id } })
    res.json({ message: "Department deleted successfully." })
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Department not found." })
    res.status(500).json({ message: "Failed to delete department." })
  }
})

export default router
