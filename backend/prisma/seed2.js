import prisma from "../db.js"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🚀 Starting seed2 (Part 1)...")

  const doctorPw = await bcrypt.hash("123456", 10)
  const patientPw = await bcrypt.hash("654321", 10)

  // === 1️⃣ Bác sĩ (18 người - 6 chuyên khoa) ===
  const doctors = [
    // --- Cardiology ---
    { fullname: "Dr. Nguyen Van Khoa", email: "khoavn@hospital.vn", gender: "M", qualification: "Cardiologist, MD", fee: 450000, specialtyId: 1 },
    { fullname: "Dr. Tran Thi Tam", email: "tamtt@hospital.vn", gender: "F", qualification: "Cardiology Specialist Level 1", fee: 400000, specialtyId: 1 },
    { fullname: "Dr. Le Minh Phong", email: "phonglm@hospital.vn", gender: "M", qualification: "Heart Surgeon", fee: 500000, specialtyId: 1 },

    // --- Neurology ---
    { fullname: "Dr. Nguyen Bao Nam", email: "nambn@hospital.vn", gender: "M", qualification: "Neurologist", fee: 420000, specialtyId: 2 },
    { fullname: "Dr. Pham Thi Hong", email: "hongpth@hospital.vn", gender: "F", qualification: "Specialist in Brain Disorders", fee: 430000, specialtyId: 2 },
    { fullname: "Dr. Tran Quoc Hung", email: "hungtq@hospital.vn", gender: "M", qualification: "Neurosurgeon", fee: 520000, specialtyId: 2 },

    // --- Pediatrics ---
    { fullname: "Dr. Vo Thi Thanh", email: "thanhtv@hospital.vn", gender: "F", qualification: "Pediatrician, MD", fee: 350000, specialtyId: 3 },
    { fullname: "Dr. Nguyen Van Luat", email: "luatnv@hospital.vn", gender: "M", qualification: "Child Development Specialist", fee: 360000, specialtyId: 3 },
    { fullname: "Dr. Pham Minh Chau", email: "chaupm@hospital.vn", gender: "F", qualification: "Pediatric Surgeon", fee: 400000, specialtyId: 3 },

    // --- Orthopedics ---
    { fullname: "Dr. Bui Quang Hao", email: "haobq@hospital.vn", gender: "M", qualification: "Orthopedic Surgeon", fee: 480000, specialtyId: 4 },
    { fullname: "Dr. Do Thi Hanh", email: "hanhdt@hospital.vn", gender: "F", qualification: "Bone & Joint Specialist", fee: 450000, specialtyId: 4 },
    { fullname: "Dr. Nguyen Trong Nhan", email: "nhannt@hospital.vn", gender: "M", qualification: "Spine Specialist", fee: 470000, specialtyId: 4 },

    // --- Dermatology ---
    { fullname: "Dr. Le Thi Hoa", email: "hoalt@hospital.vn", gender: "F", qualification: "Dermatologist", fee: 390000, specialtyId: 5 },
    { fullname: "Dr. Tran Van Loc", email: "loctv@hospital.vn", gender: "M", qualification: "Skin Disease Specialist", fee: 400000, specialtyId: 5 },
    { fullname: "Dr. Doan Thi Nhi", email: "nhid@hospital.vn", gender: "F", qualification: "Cosmetic Dermatology", fee: 420000, specialtyId: 5 },

    // --- Psychiatry ---
    { fullname: "Dr. Nguyen Anh Dung", email: "dungna@hospital.vn", gender: "M", qualification: "Psychiatrist, MD", fee: 380000, specialtyId: 6 },
    { fullname: "Dr. Pham Thi Trang", email: "trangpt@hospital.vn", gender: "F", qualification: "Mental Health Counselor", fee: 370000, specialtyId: 6 },
    { fullname: "Dr. Tran Dinh Quan", email: "quantd@hospital.vn", gender: "M", qualification: "Clinical Psychologist", fee: 400000, specialtyId: 6 }
  ]

  for (const d of doctors) {
    await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        fullname: d.fullname,
        email: d.email,
        password: doctorPw,
        phone: "09" + Math.floor(100000000 + Math.random() * 899999999),
        role: "DOCTOR",
        doctorInfo: {
          create: {
            gender: d.gender,
            qualification: d.qualification,
            fee: d.fee,
            specialtyId: d.specialtyId
          }
        }
      }
    })
  }

  console.log("✅ Added 18 doctors")

  // === 2️⃣ Bệnh nhân (20 người) ===
  const patients = [
    { fullname: "Nguyen Van Long", email: "longnv@gmail.com", gender: "M", dob: new Date("1980-05-12T00:00:00+07:00") },
    { fullname: "Tran Thi Huong", email: "huongtt@gmail.com", gender: "F", dob: new Date("1992-09-23T00:00:00+07:00") },
    { fullname: "Le Van Tien", email: "tienlv@gmail.com", gender: "M", dob: new Date("1978-03-10T00:00:00+07:00") },
    { fullname: "Do Thi Lan", email: "landt@gmail.com", gender: "F", dob: new Date("2000-12-01T00:00:00+07:00") },
    { fullname: "Nguyen Van Hung", email: "hungnv@gmail.com", gender: "M", dob: new Date("1965-04-15T00:00:00+07:00") },
    { fullname: "Pham Thi Ngoc", email: "ngocpt@gmail.com", gender: "F", dob: new Date("1999-07-19T00:00:00+07:00") },
    { fullname: "Tran Van Kien", email: "kientv@gmail.com", gender: "M", dob: new Date("1985-11-08T00:00:00+07:00") },
    { fullname: "Vo Thi Thanh", email: "thanhtv2@gmail.com", gender: "F", dob: new Date("1971-08-25T00:00:00+07:00") },
    { fullname: "Le Van Dung", email: "dunglv@gmail.com", gender: "M", dob: new Date("1996-09-02T00:00:00+07:00") },
    { fullname: "Nguyen Thi My", email: "mynh@gmail.com", gender: "F", dob: new Date("2003-01-15T00:00:00+07:00") },
    { fullname: "Pham Van Dat", email: "datpv@gmail.com", gender: "M", dob: new Date("2007-10-03T00:00:00+07:00") },
    { fullname: "Tran Thi Thu", email: "thutt@gmail.com", gender: "F", dob: new Date("1979-06-30T00:00:00+07:00") },
    { fullname: "Hoang Van Quoc", email: "quochv@gmail.com", gender: "M", dob: new Date("1958-11-22T00:00:00+07:00") },
    { fullname: "Nguyen Thi Phuong", email: "phuongnt@gmail.com", gender: "F", dob: new Date("1987-02-14T00:00:00+07:00") },
    { fullname: "Le Van Tu", email: "tulv@gmail.com", gender: "M", dob: new Date("2012-09-05T00:00:00+07:00") },
    { fullname: "Tran Thi Han", email: "hantran@gmail.com", gender: "F", dob: new Date("2010-03-28T00:00:00+07:00") },
    { fullname: "Do Van Linh", email: "linhdv@gmail.com", gender: "M", dob: new Date("1976-07-09T00:00:00+07:00") },
    { fullname: "Vo Thi Hien", email: "hienvo@gmail.com", gender: "F", dob: new Date("1969-05-04T00:00:00+07:00") },
    { fullname: "Nguyen Van Huy", email: "huynv@gmail.com", gender: "M", dob: new Date("2005-11-29T00:00:00+07:00") },
    { fullname: "Pham Thi Yen", email: "yenpt@gmail.com", gender: "F", dob: new Date("2015-04-17T00:00:00+07:00") }
  ]

  for (const p of patients) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        fullname: p.fullname,
        email: p.email,
        password: patientPw,
        phone: "08" + Math.floor(100000000 + Math.random() * 899999999),
        role: "PATIENT",
        patientInfo: {
          create: {
            gender: p.gender,
            dob: p.dob
          }
        }
      }
    })
  }

  console.log("✅ Added 20 patients")
}

main()
  .catch(e => {
    console.error("❌ Seed2 (Part 1) failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
