# 🏥 Hospital Appointment Management System

A **Full-Stack Web Application** for managing hospital appointments — designed for **Administrators**, **Doctors**, and **Patients**.  
It enables hospitals to efficiently handle **doctor schedules**, **appointment booking**, **medical records**, and **report generation**.

---

## 💻 Tech Stack

| Category | Technologies |
|:----------|:-------------|
| **Frontend** | React, Vite, React Router DOM, Axios |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL |
| **Authentication & Security** | JWT, bcryptjs |
| **Development Tools** | Git, GitHub, VS Code |

---

## 🧭 Features

| Role | Main Responsibilities |
|:-----|:-----------------------|
| **Admin** | Manage doctors, specialties, schedules, and reports |
| **Doctor** | View and update assigned appointments, record diagnosis and prescriptions |
| **Patient** | Register, book appointments, and check medical history |

---

## 🧩 Database Design (ERD & Schema Diagram)

The following diagram illustrates the **database structure and relationships** used in the Hospital Appointment Management System.

<p align="center">
  <img src="./docs/demo/ERD.drawio.png" width="800" alt="ERD Diagram" />
</p>
<p align="center">
  <img src="./docs/demo/csdl.drawio.png" width="800" alt="Schema Diagram" />
</p>

---

## 🖼️ DEMO

### 👩‍💼 **Admin Interface**

<p align="center">
  <img src="./docs/demo/login-page.png" width="380" alt="Login Page" />
  <img src="./docs/demo/register-page.png" width="380" alt="Register Page" />
</p>

#### 🔹 Step-by-Step

1. **Login / Register**  
   → Access the Admin Dashboard after successful authentication.  
   <p align="center"><img src="./docs/demo/admin-dashboard.png" width="700" alt="Admin Dashboard" /></p>

2. **Departments / Specialties**  
   → Add or edit medical departments and assign specialties to doctors.  
   <p align="center"><img src="./docs/demo/admin-departments.png" width="700" alt="Departments Page" /></p>

3. **Doctors Management**  
   → Create new doctors, assign specialties, and manage doctor data.  
   <p align="center">
      <img src="./docs/demo/admin-doctorlist.png" width="340" alt="Doctor List" />
      <img src="./docs/demo/admin-addDoctor.png" width="340" alt="Add Doctor Modal" />
   </p>

4. **Work Schedules**  
   → Define available shifts (start/end time, period) and assign them to doctors.  
   <p align="center"><img src="./docs/demo/admin-schedule.png" width="700" alt="Work Schedule Page" /></p>

5. **Appointments Overview**  
   → View and filter all appointments by date, doctor, or status.  
   <p align="center"><img src="./docs/demo/admin-appointments.png" width="700" alt="Appointments Overview" /></p>

---

### 👨‍⚕️ **Doctor Interface**

<p align="center">
  <img src="./docs/demo/doctor-dashboard.png" width="700" alt="Doctor Dashboard" />
</p>

#### 🔹 Step-by-Step

1. **Login as Doctor**  
   → Redirected to the Doctor Dashboard showing today’s appointments.  

2. **View Appointments**  
   → Filter by date or status (*Booked, Completed, Cancelled*).  
   <p align="center"><img src="./docs/demo/doctor-appointments.png" width="700" alt="Doctor Appointment List" /></p>

3. **Appointment Details**  
   → Open details to review patient info, symptoms, and requests.  
   <p align="center"><img src="./docs/demo/doctor-details.png" width="700" alt="Appointment Details" /></p>

4. **Add Medical Notes**  
   → Input *Diagnosis*, *Doctor Notes*, and *Prescription*.  
   <p align="center"><img src="./docs/demo/doctor-diagnosis.png" width="700" alt="Add Diagnosis" /></p>

5. **Update Status**  
   → Mark the appointment as *Completed*, *Cancelled*, or *Absent*.  

6. **My Patients**  
   → View the list of all patients the doctor has examined, including detailed medical records and previous diagnoses.  
   <p align="center"><img src="./docs/demo/doctor-myPatients.png" width="700" alt="My Patients Page" /></p>

---

### 🧍‍♀️ **Patient Interface**

<p align="center">
  <img src="./docs/demo/patient-home.png" width="700" alt="Patient Home" />
</p>

#### 🔹 Step-by-Step

1. **Register / Login as Patient**  
   → Access the patient homepage.  

2. **View Available Doctors**  
   → Filter by department or specialty to see suitable doctors.  
   <p align="center"><img src="./docs/demo/patient-doctors.png" width="700" alt="Doctor List for Patient" /></p>

3. **Book an Appointment**  
   → Select doctor → choose date → pick available shift → confirm booking.  
   <p align="center"><img src="./docs/demo/patient-booking.png" width="700" alt="Booking Page" /></p>

4. **My Appointments Page**  
   → View all upcoming and past appointments with current statuses.  
   <p align="center"><img src="./docs/demo/patient-appointments.png" width="700" alt="My Appointments" /></p>

5. **Medical Records**  
   → After consultation, view doctor’s notes, diagnosis, and prescription history.  
   <p align="center"><img src="./docs/demo/patient-history.png" width="700" alt="Medical Records" /></p>
    <p align="center"><img src="./docs/demo/patient-history-detail.png" width="700" alt="Medical Records Detail" /></p>

5. **Support & User Guide**  
   <p align="center"><img src="./docs/demo/patient-support.png" width="700" alt="Medical Records" /></p>
---

## 🚀 Run the Project on Your Machine

### ⚙️ Prerequisites
Before starting, make sure you have installed:
- **Node.js** ≥ 18.x  
- **npm** ≥ 9.x  
- **PostgreSQL** ≥ 14  
- **Git**

---

### 🧱 1. Clone Repository
| Step | Command |
|:-----|:---------|
| Clone the project from GitHub | `git clone https://github.com/your-username/hospital-appointment-management-system.git` |
| Move into the project directory | `cd hospital-appointment-management-system` |

---

### 🗃️ 2. Setup Database (Local PostgreSQL)
| Step | Command |
|:-----|:---------|
| Create a new database in PostgreSQL | `CREATE DATABASE hospitaldb;` |

---

### 🖥️ 3. Backend Setup
| Step | Command |
|:-----|:---------|
| Navigate to backend folder | `cd backend` |
| Install dependencies | `npm install` |
| Create `.env` file and add the following variables |  

| Generate Prisma client | `npx prisma generate` |
| Apply database migrations | `npx prisma migrate dev --name init` |
| (Optional) Insert sample seed data | `npx prisma db seed` |
| Start the backend server | `npm run dev` |

✅ The backend server will run at **http://localhost:5050**

---

### 💻 4. Frontend Setup
| Step | Command |
|:-----|:---------|
| Move to frontend directory | `cd ../frontend` |
| Install dependencies | `npm install` |
| Create `.env` file and add: |  
| Start the frontend server | `npm run dev` |

✅ The frontend server will run at **http://localhost:5173**

---

### 👤 5. Test Accounts (from Seed Data)

| Role | Email | Password |
|:-----|:-------|:----------|
| Admin | admin@example.com | admin123 |
| Doctor | doctor1@example.com | doctor123 |
| Patient | patient1@example.com | patient123 |

Use these accounts to log in and explore the system.

---

### 🧩 6. Build for Production (Optional)
| Step | Command |
|:-----|:---------|
| Build frontend for production | `cd frontend` → `npm run build` → `npm run preview` |
| Build and run backend in production | `cd ../backend` → `npm run build` → `npm start` |

---

### 🧰 7. Common Issues
| Issue | Possible Cause / Solution |
|:------|:---------------------------|
| **Database connection error** | Check the `DATABASE_URL` in your `.env` file and ensure PostgreSQL is running. |
| **Prisma migration fails** | Make sure the database exists before running `npx prisma migrate dev`. |
| **CORS issue in frontend** | Ensure `VITE_API_URL` matches the backend server URL. |
| **Port already in use** | Change backend port in `server.js` or frontend port in `vite.config.js`. |
| **Git push conflicts** | Run `git pull --rebase origin main` before pushing to sync updates. |

---

### ✅ Project Ready!
Open your browser and visit:  
- **Admin Dashboard:** [http://localhost:5173/admin](http://localhost:5173/admin)  
- **Doctor Dashboard:** [http://localhost:5173/doctor](http://localhost:5173/doctor)  
- **Patient Home:** [http://localhost:5173/patient](http://localhost:5173/patient)


