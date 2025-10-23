import { useState } from "react"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa"

export default function Support() {
  const patient = JSON.parse(localStorage.getItem("patient")) || { fullname: "Patient" }
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      alert("Please fill in all fields.")
      return
    }
    alert("Your message has been sent successfully.")
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <>
      <Header role="patient" />
      <div className="dashboard-container">
        <Sidebar role="patient" />
        <main className="dashboard-content">
          <h2 className="page-title mb-4">Support & User Guide</h2>

          <div className="support-contact">
            <div className="contact-card">
              <h3>Need Help?</h3>
              <p>If you have any issues or questions, feel free to reach out.</p>
              <ul>
                <li><FaEnvelope /> support@hospital.com</li>
                <li><FaPhone /> +84 123 456 789</li>
                <li><FaMapMarkerAlt /> Hanoi, Vietnam</li>
              </ul>
            </div>

            <div className="message-card">
              <h3>Send us a message</h3>
              <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} />
              <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} />
              <textarea name="message" placeholder="Your Message" rows="4" value={form.message} onChange={handleChange}></textarea>
              <button type="button" className="btn-send" onClick={handleSubmit}>
                <FaPaperPlane style={{ marginRight: "6px" }} /> Send
              </button>
            </div>
          </div>

          <div className="support-section">
            <h3>1. How to Book an Appointment</h3>
            <ul>
              <li>Log in or sign up using your email and password.</li>
              <li>Select a <strong>Department</strong> (e.g., Cardiology, Neurology).</li>
              <li>Choose a <strong>Doctor</strong> and view their qualifications and consultation fee.</li>
              <li>Select a <strong>Date</strong> and available <strong>Shift</strong>.</li>
              <li>Provide your symptoms or special requests if needed.</li>
              <li>Confirm to complete your booking. You’ll receive a confirmation notification.</li>
            </ul>

            <h3>2. How to View or Cancel an Appointment</h3>
            <ul>
              <li>Go to <strong>My Appointments</strong> to view all your bookings and their status.</li>
              <li>Click <strong>Cancel</strong> on an upcoming appointment if you cannot attend.</li>
              <li>Provide a reason if possible. The doctor’s slot will reopen automatically.</li>
              <li>To reschedule, cancel the old one first, then book a new appointment.</li>
            </ul>

            <h3>3. How to Attend Your Appointment</h3>
            <ul>
              <li>Arrive <strong>15–20 minutes early</strong> to confirm your information at the reception.</li>
              <li>Provide your appointment code or email for check-in.</li>
              <li>If you are late more than 15 minutes, your appointment may be marked “Absent”.</li>
            </ul>

            <h3>4. What If the Doctor Cancels?</h3>
            <ul>
              <li>If a doctor cancels, your appointment status becomes “Cancelled by Doctor”.</li>
              <li>You’ll receive a notification and can book a new appointment.</li>
            </ul>

            <h3>5. Viewing Your Medical History</h3>
            <ul>
              <li>After each consultation, the doctor updates your diagnosis, prescription, and notes.</li>
              <li>Check your <strong>Medical History</strong> section to review previous visits.</li>
            </ul>

            <h3>6. Frequently Asked Questions</h3>
            <ul>
              <li><strong>Can I book multiple appointments?</strong> Yes, as long as they don’t overlap.</li>
              <li><strong>Can I update my info?</strong> You can change your name, phone, gender, and date of birth — not your email.</li>
              <li><strong>Will I get reminders?</strong> Yes, automatic reminders are sent before appointments.</li>
              <li><strong>What if I forget to attend?</strong> After 3 absences, your booking ability may be restricted.</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  )
}
