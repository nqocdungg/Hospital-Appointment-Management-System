import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa"

export default function DepartmentList() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:5050/api/admin/departments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setList(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load departments.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this department?")) return
    try {
      await axios.delete(`http://localhost:5050/api/admin/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setList(list.filter((item) => item.id !== id))
      alert("Department deleted successfully.")
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete department."
      alert(msg)
    }
  }

  if (loading) return <div className="loading">Loading departments...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <>
      <Header role="admin" />

      <div className="dashboard-container">
        <Sidebar role="admin" />
        <main className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">Manage Departments</h2>
            <button
              className="small-add-btn"
              onClick={() => navigate("/admin/departments/new")}
            >
              <FaPlus style={{ marginRight: 6 }} /> Add
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((dep) => (
                <tr key={dep.id}>
                  <td>{dep.id}</td>
                  <td
                    style={{ color: "#1e3a8a", cursor: "pointer", fontWeight: 500 }}
                    onClick={() => navigate(`/admin/departments/${dep.id}`)}
                  >
                    {dep.name}
                  </td>
                  <td>{dep.description || "—"}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/admin/departments/${dep.id}`)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/departments/edit/${dep.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(dep.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </>
  )
}
