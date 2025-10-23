import { useEffect, useState } from "react"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { motion } from "framer-motion"
import { FaCalendarCheck, FaUserInjured, FaChartBar, FaClock } from "react-icons/fa"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function DoctorDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"]

  const doctor = JSON.parse(localStorage.getItem("doctor")) || { fullname: "Doctor" }

  useEffect(() => {
    async function fetchOverview() {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get("http://localhost:5050/api/doctor/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOverview(res.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">{error}</div>

  const appointmentTrend = Array.isArray(overview?.appointmentTrend)
    ? overview.appointmentTrend.map(item => ({
        date: item.date ?? item.Date,
        count: item.count ?? item.Count,
      }))
    : []

  const patientStats = Array.isArray(overview?.patientStats)
    ? overview.patientStats.map(item => ({
        status: item.status ?? item.Status,
        value: item.value ?? item.Value,
      }))
    : []

  return (
    <>
      <Header role="doctor" />
      <div className="dashboard-container">
        <Sidebar role="doctor" />
        <main className="dashboard-content">
          <h2 className="page-title">My Dashboard</h2>

          <motion.div
            className="overview-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            <AnimatedCard title="Today's Appointments" value={overview.todayAppointments} icon={<FaCalendarCheck />} color="blue" />
            <AnimatedCard title="Patients This Week" value={overview.weeklyPatients} icon={<FaUserInjured />} color="green" />
            <AnimatedCard title="Average Consultation Time" value={`${overview.avgConsultTime || 0} mins`} icon={<FaClock />} color="yellow" />
            <AnimatedCard title="Pending Reports" value={overview.pendingReports} icon={<FaChartBar />} color="purple" />
          </motion.div>

          <div className="charts-grid">
            <ChartBox title="Appointments in the Last 7 Days">
              {appointmentTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={appointmentTrend}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="nodata">No appointment trend data</p>
              )}
            </ChartBox>

            <ChartBox title="Patient Status Breakdown">
              {patientStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={patientStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      nameKey="status"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {patientStats.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip formatter={(value, name, entry) => [`${value}`, entry.payload.status]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="nodata">No patient status data</p>
              )}
            </ChartBox>
          </div>
        </main>
      </div>
    </>
  )
}

function AnimatedCard({ title, value, icon, color }) {
  return (
    <motion.div
      className={`overview-card ${color}`}
      whileHover={{ scale: 1.05 }}
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <div className="card-icon">{icon}</div>
      <div className="card-info">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </motion.div>
  )
}

function ChartBox({ title, children }) {
  return (
    <motion.div
      className="chart-box"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="chart-title">{title}</h3>
      {children}
    </motion.div>
  )
}
