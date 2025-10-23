import express from "express"
import prisma from "../../db.js"
import authMiddleware from "../../middleware/authMiddleware.js"

const router = express.Router()
router.use(authMiddleware)

const BASE_URL = process.env.BASE_URL || "http://localhost:5050"

router.get("/", async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany({
      include: {
        doctors: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { id: "asc" },
    })

    const formatted = specialties.map((sp) => ({
      specialtyId: sp.id,
      specialtyName: sp.name,
      description: sp.description,
      doctors: sp.doctors.map((doc) => ({
        id: doc.userId,
        fullname: doc.user.fullname,
        email: doc.user.email,
        photo: doc.photo ? `${BASE_URL}${doc.photo}` : null,
        qualification: doc.qualification,
        fee: doc.fee,
      })),
    }))

    res.json(formatted)
  } catch (err) {
    console.error("Error fetching doctors by specialty:", err)
    res.status(500).json({ message: "Failed to fetch doctors by specialty" })
  }
})

export default router
