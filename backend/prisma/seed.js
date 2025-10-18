import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding hospital system database...")

  /* ----------------------------------
     1️⃣  Create Admin
  ---------------------------------- */
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

  /* ----------------------------------
     2️⃣  Create Specialties
  ---------------------------------- */
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

  /* ----------------------------------
     3️⃣  Create Doctors
  ---------------------------------- */
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

  /* ----------------------------------
     4️⃣  Create Patients
  ---------------------------------- */
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
        phone: p.phone, // ✅ moved here
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

  /* ----------------------------------
     5️⃣  Create Shifts
  ---------------------------------- */
  const shiftMorning = await prisma.shift.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startTime: new Date("1970-01-01T08:00:00+07:00"),
      endTime: new Date("1970-01-01T12:00:00+07:00"),
      period: "S",
    },
  })

  const shiftAfternoon = await prisma.shift.upsert({
    where: { id: 2 },
    update: {},
    create: {
      startTime: new Date("1970-01-01T13:00:00+07:00"),
      endTime: new Date("1970-01-01T17:00:00+07:00"),
      period: "C",
    },
  })

  console.log("✅ Shifts created")

  /* ----------------------------------
     6️⃣  Create WorkSchedules + Appointments
  ---------------------------------- */
  const doctorInfos = await prisma.doctorInfo.findMany()
  const patientInfos = await prisma.patientInfo.findMany()
  const today = new Date()

  const ws1 = await prisma.workSchedule.create({
    data: {
      doctorId: doctorInfos[0].id,
      date: today,
      shiftId: shiftMorning.id,
      status: 0,
    },
  })
  const ws2 = await prisma.workSchedule.create({
    data: {
      doctorId: doctorInfos[1].id,
      date: today,
      shiftId: shiftAfternoon.id,
      status: 1,
    },
  })
  const ws3 = await prisma.workSchedule.create({
    data: {
      doctorId: doctorInfos[2].id,
      date: today,
      shiftId: shiftMorning.id,
      status: 0,
    },
  })

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patientInfos[0].id,
        scheduleId: ws1.id,
        status: 0,
        symptom: "Chest pain",
        request: "Check-up",
      },
      {
        patientId: patientInfos[1].id,
        scheduleId: ws2.id,
        status: 1,
        symptom: "Headache",
        request: "MRI scan",
      },
      {
        patientId: patientInfos[2].id,
        scheduleId: ws3.id,
        status: 0,
        symptom: "Fever",
        request: "Pediatric exam",
      },
    ],
  })

  console.log("✅ WorkSchedules & Appointments created")
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
