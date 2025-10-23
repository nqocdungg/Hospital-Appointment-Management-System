// prisma/seed3.js
import prisma from "../db.js"
import bcrypt from "bcryptjs"

// =====================
// Config & Utilities
// =====================
const TZ = "+07:00"
const START_DATE = new Date("2025-08-01T00:00:00" + TZ)
const END_DATE   = new Date("2025-10-20T00:00:00" + TZ)

// WorkSchedule status: 0 Free, 1 Busy, 2 Off
// Target ratio: 55% Free / 30% Busy / 15% Off
function scheduleStatusFor(seed) {
  // deterministic bucket 0..19  ->  0..10 => Free(55%), 11..16 => Busy(30%), 17..19 => Off(15%)
  const b = seed % 20
  if (b <= 10) return 0
  if (b <= 16) return 1
  return 2
}

function* dateRangeInclusive(start, end) {
  const d = new Date(start.getTime())
  while (d <= end) {
    yield new Date(d.getTime())
    d.setDate(d.getDate() + 1)
  }
}

const shiftsInput = [
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

// Appointment status distribution (completed most common)
// cycle index % 10 -> value
const APPT_STATUS_CYCLE = [1,1,1,1,1,1,0,2,3,4] // 60% 1(Completed), 10% 0(Booked), 10% 2(Cancelled), 10% 3(DoctorCancelled), 10% 4(Absent)

const symptomBySpec = {
  1: ["Chest pain", "Shortness of breath", "Fatigue"],
  2: ["Headache", "Dizziness", "Seizure follow-up"],
  3: ["Fever", "Cough", "Allergy rash"],
  4: ["Knee pain", "Back pain", "Post-fracture check"],
  5: ["Itchy rash", "Acne flare", "Eczema"],
  6: ["Anxiety", "Insomnia", "Low mood"]
}
const requestBySpec = {
  1: ["Cardiac consultation", "ECG review", "Medication adjustment"],
  2: ["Neurological assessment", "EEG result discussion", "MRI follow-up"],
  3: ["Pediatric check-up", "Vaccination review", "Diet advice"],
  4: ["Orthopedic evaluation", "Physiotherapy plan", "X-ray review"],
  5: ["Dermatology treatment", "Topical regimen", "Allergy test result"],
  6: ["Counseling session", "Medication review", "Psychotherapy"]
}
const diagnosisBySpec = {
  1: ["Hypertension", "Coronary artery disease", "Hyperlipidemia"],
  2: ["Migraine", "Epilepsy", "Tension headache"],
  3: ["Acute viral infection", "Allergic rhinitis", "Atopic dermatitis"],
  4: ["Osteoarthritis", "Lumbar strain", "Post-fracture recovery"],
  5: ["Dermatitis", "Acne vulgaris", "Contact allergy"],
  6: ["Generalized anxiety disorder", "Major depressive episode", "Adjustment disorder"]
}
const prescriptionBySpec = {
  1: ["Aspirin 81mg daily", "Atorvastatin 20mg nightly", "Losartan 50mg daily"],
  2: ["Topiramate 25mg nightly", "Carbamazepine 200mg bid", "Amitriptyline 10mg nightly"],
  3: ["Paracetamol 250mg prn", "Cetirizine 5mg nightly", "Saline nasal spray"],
  4: ["Ibuprofen 400mg prn", "Diclofenac gel topical", "Physio exercises daily"],
  5: ["Hydrocortisone 1% cream", "Benzoyl peroxide wash", "Loratadine 10mg daily"],
  6: ["Sertraline 50mg daily", "Diazepam 2mg prn", "CBT weekly sessions"]
}

function pickDeterministic(arr, seed) {
  return arr[seed % arr.length]
}

async function ensureShifts() {
  const existing = await prisma.shift.findMany()
  const byKey = new Map(existing.map(s => [`${s.startTime}-${s.endTime}-${s.period}`, s]))

  const ensured = []
  for (const sh of shiftsInput) {
    const key = `${sh.startTime}-${sh.endTime}-${sh.period}`
    if (byKey.has(key)) {
      ensured.push(byKey.get(key))
    } else {
      const created = await prisma.shift.create({ data: sh })
      ensured.push(created)
    }
  }
  // return in the input order
  const sortMap = new Map(ensured.map(s => [`${s.startTime}-${s.endTime}-${s.period}`, s]))
  return shiftsInput.map(sh => sortMap.get(`${sh.startTime}-${sh.endTime}-${sh.period}`))
}

async function getAllDoctors() {
  return prisma.doctorInfo.findMany({
    include: { user: true, specialty: true }
  })
}

async function getAllPatients() {
  return prisma.patientInfo.findMany({
    include: { user: true }
  })
}

// For a doctor & date, select 2–4 shifts deterministically (not random)
function selectShiftIndicesForDay(doctorId, dayIndex) {
  // prefer spread across morning/afternoon for realism
  // deterministic based on (doctorId, dayIndex)
  const base = (doctorId * 31 + dayIndex * 17) >>> 0
  const count = 2 + (base % 3) // 2..4
  const indices = []
  // alternate bucket: morning(0..8) vs afternoon(9..16)
  const morningFirst = (base % 2) === 0
  const pool1 = morningFirst ? [0,1,2,3,4,5,6,7,8] : [9,10,11,12,13,14,15,16]
  const pool2 = morningFirst ? [9,10,11,12,13,14,15,16] : [0,1,2,3,4,5,6,7,8]

  let b = base
  for (let i = 0; i < count; i++) {
    const pool = (i % 2 === 0) ? pool1 : pool2
    const pick = pool[b % pool.length]
    if (!indices.includes(pick)) indices.push(pick)
    b = (b * 1103515245 + 12345) >>> 0 // LCG step (deterministic)
  }
  return indices.sort((a,b) => a-b)
}

// Decide whether doctor works on a given day (about ~40–50% of days)
function doctorWorksThatDay(doctorId, dayIndex) {
  const r = (doctorId * 13 + dayIndex * 7) % 10
  return r <= 4 // ~50% of days
}

// =====================
// Main seeding
// =====================
async function main() {
  console.log("🚀 seed3: start")

  // 0) Ensure Shifts exist & ordered
  const shifts = await ensureShifts()
  const shiftIds = shifts.map(s => s.id)
  console.log(`ℹ️ Shifts ensured: ${shiftIds.length} entries`)

  // 1) Load Doctors & Patients
  const doctors = await getAllDoctors()
  if (doctors.length === 0) {
    throw new Error("No doctors found. Please run seed2 (part 1) first.")
  }
  const patients = await getAllPatients()
  if (patients.length === 0) {
    throw new Error("No patients found. Please run seed2 (part 1) first.")
  }
  console.log(`ℹ️ Doctors: ${doctors.length}, Patients: ${patients.length}`)

  // 2) Create WorkSchedules for all doctors 01/08 → 20/10 (avoid duplicates)
  let createdSchedules = 0
  let skippedExistingSchedules = 0

  const dates = Array.from(dateRangeInclusive(START_DATE, END_DATE))
  for (const doc of doctors) {
    for (let di = 0; di < dates.length; di++) {
      const date = dates[di]
      // doctor does not work every day
      if (!doctorWorksThatDay(doc.id, di)) continue

      const shiftIdxs = selectShiftIndicesForDay(doc.id, di)
      for (let si = 0; si < shiftIdxs.length; si++) {
        const shiftId = shiftIds[shiftIdxs[si]]

        // Skip if a schedule already exists for (doctorId, date, shiftId)
        const existed = await prisma.workSchedule.findFirst({
          where: { doctorId: doc.id, date, shiftId }
        })
        if (existed) {
          skippedExistingSchedules++
          continue
        }

        const status = scheduleStatusFor(doc.id + di + si)
        await prisma.workSchedule.create({
          data: {
            doctorId: doc.id,
            date,
            shiftId,
            status
          }
        })
        createdSchedules++
      }
    }
  }
  console.log(`✅ WorkSchedules created: ${createdSchedules} (skipped existing: ${skippedExistingSchedules})`)

  // 3) Create ~100 Appointments on Busy schedules without existing appointment
  // collect busy schedules (status=1) within date range & no appointment yet
  const busySchedules = await prisma.workSchedule.findMany({
    where: {
      date: { gte: START_DATE, lte: END_DATE },
      status: 1
    },
    include: { appointment: true, doctor: { include: { specialty: true } } },
    orderBy: [{ date: "asc" }, { shiftId: "asc" }]
  })

  const emptyBusy = busySchedules.filter(s => !s.appointment)
  const TARGET_APPTS = 100
  const toUse = emptyBusy.slice(0, TARGET_APPTS)

  let createdAppointments = 0
  let createdRecords = 0

  for (let i = 0; i < toUse.length; i++) {
    const sched = toUse[i]
    const pat = patients[(i * 7) % patients.length] // deterministic spread of patients
    const apptStatus = APPT_STATUS_CYCLE[i % APPT_STATUS_CYCLE.length]

    const specId = sched.doctor?.specialtyId || 6

    const symptom = pickDeterministic(symptomBySpec[specId], i)
    const request = pickDeterministic(requestBySpec[specId], i + 3)

    const appt = await prisma.appointment.create({
      data: {
        patientId: pat.id,
        scheduleId: sched.id,
        status: apptStatus,
        symptom,
        request,
        note: apptStatus === 1
          ? "Completed appointment with advice."
          : apptStatus === 0
            ? "Booking confirmed."
            : apptStatus === 2
              ? "Cancelled by patient."
              : apptStatus === 3
                ? "Cancelled by doctor."
                : "Patient did not show up."
      }
    })
    createdAppointments++

    if (apptStatus === 1) {
      const diagnosis = pickDeterministic(diagnosisBySpec[specId], i + 5)
      const prescription = pickDeterministic(prescriptionBySpec[specId], i + 11)
      await prisma.medicalRecord.upsert({
        where: { appointmentId: appt.id },
        update: {},
        create: {
          appointmentId: appt.id,
          diagnosis,
          prescription,
          note: "Patient advised to follow treatment and lifestyle guidance."
        }
      })
      createdRecords++
    }
  }

  console.log(`✅ Appointments created: ${createdAppointments} (target ${TARGET_APPTS})`)
  console.log(`✅ Medical records created for completed: ${createdRecords}`)

  // 4) Summary by status
  const statusCounts = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { status: true },
    where: { schedule: { date: { gte: START_DATE, lte: END_DATE } } }
  })
  console.log("ℹ️ Appointment counts (in date range):", statusCounts)

  console.log("🎉 seed3 finished successfully.")
}

main()
  .catch((e) => {
    console.error("❌ seed3 failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
