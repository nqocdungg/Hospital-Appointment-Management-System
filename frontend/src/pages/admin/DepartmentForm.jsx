import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import axios from "axios"

export default function DepartmentForm({ mode = "add" }) {
  const isEdit = mode === "edit"
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [form, setForm] = useState({ name: "", description: "" })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    async function fetchData() {
      try {
        const res = await axios.get(`http://localhost:5050/api/admin/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { name, description } = res.data
        setForm({ name, description: description || "" })
      } catch {
        setError("Failed to load department.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, isEdit])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || saving) return
    try {
      setSaving(true)
      if (isEdit) {
        await axios.put(`http://localhost:5050/api/admin/departments/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert("Updated successfully.")
      } else {
        await axios.post(`http://localhost:5050/api/admin/departments`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        alert("Created successfully.")
      }
      navigate("/admin/departments")
    } catch (err) {
      const msg = err?.response?.data?.message || "Save failed."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">
              {isEdit ? "Edit Department" : "Add Department"}
            </h2>
            <button className="small-add-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>

          {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Department Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate("/admin/departments")}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
