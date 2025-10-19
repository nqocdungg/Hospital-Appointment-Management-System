import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding hospital system database...")

  // 1️⃣ Admin
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

  // 2️⃣ Specialties
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

  // 3️⃣ Doctors
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

  // 4️⃣ Patients
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
  console.log("✅ Patients created")

  // 5️⃣ 17 Fixed Shifts
  await prisma.shift.deleteMany()
  const shifts = [
    { startTime: new Date("1970-01-01T07:00:00Z"), endTime: new Date("1970-01-01T07:30:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T07:30:00Z"), endTime: new Date("1970-01-01T08:00:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T08:00:00Z"), endTime: new Date("1970-01-01T08:30:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T08:30:00Z"), endTime: new Date("1970-01-01T09:00:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T09:00:00Z"), endTime: new Date("1970-01-01T09:30:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T09:30:00Z"), endTime: new Date("1970-01-01T10:00:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T10:00:00Z"), endTime: new Date("1970-01-01T10:30:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T10:30:00Z"), endTime: new Date("1970-01-01T11:00:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T11:00:00Z"), endTime: new Date("1970-01-01T11:30:00Z"), period: "Morning" },
    { startTime: new Date("1970-01-01T13:00:00Z"), endTime: new Date("1970-01-01T13:30:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T13:30:00Z"), endTime: new Date("1970-01-01T14:00:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T14:00:00Z"), endTime: new Date("1970-01-01T14:30:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T14:30:00Z"), endTime: new Date("1970-01-01T15:00:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T15:00:00Z"), endTime: new Date("1970-01-01T15:30:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T15:30:00Z"), endTime: new Date("1970-01-01T16:00:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T16:00:00Z"), endTime: new Date("1970-01-01T16:30:00Z"), period: "Afternoon" },
    { startTime: new Date("1970-01-01T16:30:00Z"), endTime: new Date("1970-01-01T17:00:00Z"), period: "Afternoon" },
  ]
  await prisma.shift.createMany({ data: shifts, skipDuplicates: true })
  console.log("✅ Seeded 17 fixed shifts (07:00–17:00).")

  // 6️⃣ Sample Work Schedules
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
