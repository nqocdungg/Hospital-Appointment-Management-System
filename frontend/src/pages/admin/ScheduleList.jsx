import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaPlus, FaSort, FaEdit, FaTrash } from "react-icons/fa"

export default function ScheduleList() {
  const [schedules, setSchedules] = useState([])
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [shifts, setShifts] = useState([])
  const [q, setQ] = useState("")
  const [specialtyId, setSpecialtyId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [status, setStatus] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [addForm, setAddForm] = useState({ specialtyId: "", doctorId: "", date: "", shiftIds: [] })
  const [editRowId, setEditRowId] = useState(null)
  const [statusDraft, setStatusDraft] = useState("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const token = localStorage.getItem("token")

  useEffect(() => {
    loadMeta()
    fetchSchedules()
  }, [])

  async function loadMeta() {
    try {
      const [docRes, depRes, shiftRes] = await Promise.all([
        axios.get("http://localhost:5050/api/admin/doctors", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5050/api/admin/departments", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5050/api/admin/schedules/shifts", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setDoctors(docRes.data)
      setSpecialties(depRes.data)
      setShifts(shiftRes.data)
    } catch {
      setError("Failed to load meta data.")
    }
  }

  async function fetchSchedules() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get("http://localhost:5050/api/admin/schedules", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: q || undefined,
          specialtyId: specialtyId || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          status: status !== "" ? status : undefined,
          sort: sortDesc ? "desc" : "asc",
        },
      })
      setSchedules(res.data)
    } catch {
      setError("Failed to load schedules.")
    } finally {
      setLoading(false)
    }
  }

  const doctorsBySpecialty = useMemo(() => {
    if (!addForm.specialtyId) return doctors
    return doctors.filter((d) => String(d.specialty?.id || "") === String(addForm.specialtyId))
  }, [addForm.specialtyId, doctors])

  function toggleSort() {
    setSortDesc((p) => !p)
    setTimeout(fetchSchedules, 0)
  }

  function startEdit(row) {
    setEditRowId(row.id)
    setStatusDraft(String(row.status))
  }

  async function saveRow(id) {
    try {
      await axios.patch(
        `http://localhost:5050/api/admin/schedules/${id}/status`,
        { status: Number(statusDraft) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditRowId(null)
      fetchSchedules()
    } catch {
      alert("Failed to update status.")
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this schedule?")) return
    try {
      await axios.delete(`http://localhost:5050/api/admin/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSchedules((prev) => prev.filter((x) => x.id !== id))
      if (editRowId === id) setEditRowId(null)
    } catch {
      alert("Failed to delete schedule.")
    }
  }

  async function submitAdd(e) {
    e.preventDefault()
    if (!addForm.doctorId || !addForm.date || addForm.shiftIds.length === 0) {
      alert("Please select doctor, date and at least one shift.")
      return
    }
    try {
      await axios.post(
        "http://localhost:5050/api/admin/schedules/bulk",
        {
          doctorId: Number(addForm.doctorId),
          date: addForm.date,
          shiftIds: addForm.shiftIds.map(Number),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOpenAdd(false)
      setAddForm({ specialtyId: "", doctorId: "", date: "", shiftIds: [] })
      fetchSchedules()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create schedules.")
    }
  }

  if (loading) return <div className="loading">Loading schedules...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">Work Schedule Management</h2>
            <button className="small-add-btn" onClick={() => setOpenAdd(true)}>
              <FaPlus /> Add Schedule
            </button>
          </div>

          {/* === New Filter Toolbar === */}
          <div className="filter-container">
            <div className="filter-row">
              <div className="filter-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="Search by doctor..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchSchedules()}
                />
              </div>

              <div className="filter-group">
                <label>Specialty</label>
                <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                  <option value="">All Specialties</option>
                  {specialties.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="0">Free</option>
                  <option value="1">Busy</option>
                  <option value="2">Off</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Start Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              <div className="filter-actions">
                <button className="btn" onClick={fetchSchedules}>Apply Filters</button>
                <button className="btn-outline" onClick={toggleSort}>
                  <FaSort /> {sortDesc ? "Sort Desc" : "Sort Asc"}
                </button>
              </div>
            </div>
          </div>

          {/* === Table === */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date</th>
                <th>Period</th>
                <th>Time</th>
                <th>Status</th>
                <th width="120">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr><td colSpan="8" className="nodata">No schedule found.</td></tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.doctor}</td>
                    <td>{s.specialty}</td>
                    <td>{s.date}</td>
                    <td>{s.shift}</td>
                    <td>{s.start_time} - {s.end_time}</td>
                    <td>
                      {editRowId === s.id ? (
                        <select
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value)}
                          className="status-select"
                        >
                          <option value="0">Free</option>
                          <option value="1">Busy</option>
                          <option value="2">Off</option>
                        </select>
                      ) : (
                        s.status === 0 ? "Free" : s.status === 1 ? "Busy" : "Off"
                      )}
                    </td>
                    <td>
                      {editRowId === s.id ? (
                        <button className="btn" onClick={() => saveRow(s.id)}>Save</button>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => startEdit(s)}>
                            <FaEdit />
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(s.id)}>
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* === Modal Add Schedule === */}
          {openAdd && (
            <div className="modal">
              <div className="modal-body">
                <h3>Create New Schedule</h3>
                <form onSubmit={submitAdd} className="form-vertical">
                  <div className="form-group">
                    <label>Specialty</label>
                    <select
                      value={addForm.specialtyId}
                      onChange={(e) => setAddForm((f) => ({ ...f, specialtyId: e.target.value, doctorId: "" }))}
                      required
                    >
                      <option value="">Select specialty</option>
                      {specialties.map((sp) => (
                        <option key={sp.id} value={sp.id}>{sp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Doctor</label>
                    <select
                      value={addForm.doctorId}
                      onChange={(e) => setAddForm((f) => ({ ...f, doctorId: e.target.value }))}
                      required
                    >
                      <option value="">Select doctor</option>
                      {doctorsBySpecialty.map((d) => (
                        <option key={d.id} value={d.id}>{d.user.fullname}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={addForm.date}
                      onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Shifts (Select multiple)</label>
                    <div className="shift-grid">
                      {shifts.map((sh) => (
                        <label key={sh.id} className="shift-item">
                          <input
                            type="checkbox"
                            checked={addForm.shiftIds.includes(String(sh.id))}
                            onChange={(e) => {
                              const id = String(sh.id)
                              setAddForm((f) => ({
                                ...f,
                                shiftIds: e.target.checked
                                  ? [...f.shiftIds, id]
                                  : f.shiftIds.filter((x) => x !== id),
                              }))
                            }}
                          />
                          {sh.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-outline" onClick={() => setOpenAdd(false)}>Cancel</button>
                    <button type="submit" className="btn"><FaPlus /> Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
