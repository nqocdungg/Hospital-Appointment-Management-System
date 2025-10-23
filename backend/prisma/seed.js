import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding hospital system database...")

  const hashedAdminPass = bcrypt.hashSync("admin123", 8)
  await prisma.user.upsert({
    where: { email: "admin@hospital.vn" },
    update: {},
    create: {
      fullname: "Admin",
      email: "admin@hospital.vn",
      password: hashedAdminPass,
      role: "ADMIN",
      phone: "0000000000",
    },
  })
  console.log("✅ Admin created")

  const specialtiesData = [
    { name: "Cardiology", description: "Heart and blood vessel specialists" },
    { name: "Neurology", description: "Brain and nervous system specialists" },
    { name: "Pediatrics", description: "Child health specialists" },
    { name: "Orthopedics", description: "Bone and joint specialists" },
    { name: "Dermatology", description: "Skin specialists" },
  ]
  const specialties = []
  for (const s of specialtiesData) {
    const spec = await prisma.specialty.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    })
    specialties.push(spec)
  }
  console.log("✅ Specialties created")

  const doctorData = [
    {
      fullname: "Dr. Nguyen Chau Minh",
      email: "minhnc@hospital.vn",
      gender: "F",
      qualification: "",
      fee: 500000,
      specialtyName: "Cardiology",
      phone: "0900101111",
    },
    {
      fullname: "Dr. Tran Duc Hai",
      email: "haitd@hospital.vn",
      gender: "M",
      qualification: "Neurologist",
      fee: 400000,
      specialtyName: "Neurology",
      phone: "0902002002",
    },
    {
      fullname: "Dr. Le Phi Vu",
      email: "carol@hospital.vn",
      gender: "F",
      qualification: "Pediatrician",
      fee: 300000,
      specialtyName: "Pediatrics",
      phone: "0903003003",
    },
  ]

  for (const doc of doctorData) {
    const hashed = bcrypt.hashSync("123456", 8)
    const specialty = specialties.find((s) => s.name === doc.specialtyName)
    await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        fullname: doc.fullname,
        email: doc.email,
        password: hashed,
        phone: doc.phone,
        role: "DOCTOR",
        doctorInfo: {
          create: {
            gender: doc.gender,
            qualification: doc.qualification,
            fee: doc.fee,
            specialtyId: specialty?.id,
          },
        },
      },
    })
  }
  console.log("✅ Doctors created")

  const patientData = [
    {
      fullname: "Nguyen Van A",
      email: "a@hospital.vn",
      gender: "M",
      phone: "0912345678",
      dob: "1990-04-12",
    },
    {
      fullname: "Tran Thi B",
      email: "b@hospital.vn",
      gender: "F",
      phone: "0987654321",
      dob: "1988-09-21",
    },
    {
      fullname: "Le Van C",
      email: "c@hospital.vn",
      gender: "M",
      phone: "0909090909",
      dob: "1995-03-10",
    },
  ]
  for (const p of patientData) {
    const hashed = bcrypt.hashSync("123456", 8)
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        fullname: p.fullname,
        email: p.email,
        password: hashed,
        phone: p.phone,
        role: "PATIENT",
        patientInfo: {
          create: {
            gender: p.gender,
            dob: new Date(p.dob),
          },
        },
      },
    })
  }
  console.log("Patients created")

  await prisma.shift.deleteMany()
  const shifts = [
    { startTime: "07:00", endTime: "07:30", period: "Morning" },
    { startTime: "07:30", endTime: "08:00", period: "Morning" },
    { startTime: "08:00", endTime: "08:30", period: "Morning" },
    { startTime: "08:30", endTime: "09:00", period: "Morning" },
    { startTime: "09:00", endTime: "09:30", period: "Morning" },
    { startTime: "09:30", endTime: "10:00", period: "Morning" },
    { startTime: "10:00", endTime: "10:30", period: "Morning" },
    { startTime: "10:30", endTime: "11:00", period: "Morning" },
    { startTime: "11:00", endTime: "11:30", period: "Morning" },
    { startTime: "13:00", endTime: "13:30", period: "Afternoon" },
    { startTime: "13:30", endTime: "14:00", period: "Afternoon" },
    { startTime: "14:00", endTime: "14:30", period: "Afternoon" },
    { startTime: "14:30", endTime: "15:00", period: "Afternoon" },
    { startTime: "15:00", endTime: "15:30", period: "Afternoon" },
    { startTime: "15:30", endTime: "16:00", period: "Afternoon" },
    { startTime: "16:00", endTime: "16:30", period: "Afternoon" },
    { startTime: "16:30", endTime: "17:00", period: "Afternoon" },
  ]
  await prisma.shift.createMany({ data: shifts, skipDuplicates: true })
  console.log("Seeded 17 fixed shifts (07:00–17:00).")

  const doctorInfos = await prisma.doctorInfo.findMany()
  const today = new Date()
  await prisma.workSchedule.createMany({
    data: [
      { doctorId: doctorInfos[0].id, date: today, shiftId: 1, status: 0 },
      { doctorId: doctorInfos[0].id, date: today, shiftId: 2, status: 1 },
      { doctorId: doctorInfos[1].id, date: today, shiftId: 10, status: 0 },
      { doctorId: doctorInfos[2].id, date: today, shiftId: 15, status: 2 },
    ],
    skipDuplicates: true,
  })
  console.log("✅ Sample WorkSchedules created.")

  console.log("🎉 All seed data inserted successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
