import express from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../prismaClient.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Register /auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullname, gender, dob, phone } = req.body

  try {
    if (!email || !password || !fullname) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = bcrypt.hashSync(password, 8)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullname,
        phone, // ✅ phone thuộc User, không phải PatientInfo
        role: 'PATIENT',
        patientInfo: {
          create: {
            gender,
            dob: dob ? new Date(dob) : null, // ✅ chỉ còn gender và dob
          },
        },
      },
    })

    res.status(201).json({ message: 'Register successfully. Please login to continue.' })
  } catch (err) {
    console.log('Register error:', err.message)
    res.status(503).json({ message: 'Internal server error' })
  }
})

// Login /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).send({ message: 'User not found' })

    const passwordIsValid = bcrypt.compareSync(password, user.password)
    if (!passwordIsValid) return res.status(401).send({ message: 'Invalid password' })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(200).json({ token, role: user.role, fullname: user.fullname })
  } catch (err) {
    console.log('Login error:', err.message)
    res.status(503).json({ message: 'Internal server error' })
  }
})

export default router
