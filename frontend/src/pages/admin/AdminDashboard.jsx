import { useEffect, useState } from "react"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import { motion } from "framer-motion"
import { FaUserMd, FaUserInjured, FaCalendarCheck, FaMoneyBillWave } from "react-icons/fa"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const COLORS = [
    "#3b82f6",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ]

  const storedUser = localStorage.getItem("user")
  const user = storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser)
    : { fullname: "Admin" }

  useEffect(() => {
    async function fetchOverview() {
      const token = localStorage.getItem("token")
      try {
        const res = await axios.get("http://localhost:5050/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOverview(res.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  if (loading) return <div className="loading">Loading data...</div>
  if (error) return <div className="error">{error}</div>

  const appointmentData = Array.isArray(overview?.appointmentData)
    ? overview.appointmentData.map(item => ({
        month: item.month ?? item.Month,
        appointments: item.appointments ?? item.Appointments,
      }))
    : []

  const departmentData = Array.isArray(overview?.departmentData)
    ? overview.departmentData.map(item => ({
        department: item.department ?? item.Department,
        value: item.value ?? item.Value,
      }))
    : []

  const formatCurrency = (num) =>
    num?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "₫0"

  const renderLabel = ({ percent, value }) =>
    `${(percent * 100).toFixed(1)}%` 

  return (
    <>
      <Header role="admin" />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <h2 className="page-title">Hospital Overview</h2>

          <motion.div
            className="overview-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            <AnimatedCard title="Total Doctors" value={overview.doctors} icon={<FaUserMd />} color="blue" />
            <AnimatedCard title="Total Patients" value={overview.patients} icon={<FaUserInjured />} color="green" />
            <AnimatedCard title="Appointments Today" value={overview.appointmentsToday} icon={<FaCalendarCheck />} color="yellow" />
            <AnimatedCard title="Monthly Revenue" value={formatCurrency(overview.monthlyRevenue)} icon={<FaMoneyBillWave />} color="purple" />
          </motion.div>

          <div className="charts-grid">
            <ChartBox title="Appointments per Month">
              {appointmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={appointmentData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="nodata">No appointment data</p>
              )}
            </ChartBox>

            <ChartBox title="Patients by Department">
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                      dataKey="value"
                      label={renderLabel}
                      labelLine={false}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(value, entry) => entry.payload.department}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [`${value} appointments`, props.payload.department]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="nodata">No department data</p>
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
