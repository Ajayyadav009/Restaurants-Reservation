import { useState, useEffect, useCallback } from "react";
import { getAllTablesAdmin, createTable, updateTable, deactivateTable } from "../../api/tables";

const VALID_CAPACITIES = [2, 4, 6, 8];

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  
  const [addForm, setAddForm] = useState({ tableNumber: "", capacity: "" });
  const [addErrors, setAddErrors] = useState([]);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ capacity: "", isActive: true });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllTablesAdmin();
      setTables(data.tables);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  
  const handleAddChange = (e) => {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setAddError("");
    setAddErrors([]);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");
    setAddErrors([]);
    try {
      const { data } = await createTable({
        tableNumber: Number(addForm.tableNumber),
        capacity: Number(addForm.capacity),
      });
      setTables((prev) => [...prev, data.table].sort((a, b) => a.tableNumber - b.tableNumber));
      setAddForm({ tableNumber: "", capacity: "" });
      flash(`Table ${data.table.tableNumber} added successfully.`);
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors?.length) setAddErrors(d.errors);
      else setAddError(d?.message || "Failed to add table");
    } finally {
      setAdding(false);
    }
  };

  
  const startEdit = (table) => {
    setEditingId(table._id);
    setEditForm({ capacity: table.capacity, isActive: table.isActive });
    setEditError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setEditError("");
  };

  const handleSave = async (id) => {
    setSaving(true);
    setEditError("");
    try {
      const { data } = await updateTable(id, {
        capacity: Number(editForm.capacity),
        isActive: editForm.isActive,
      });
      setTables((prev) => prev.map((t) => t._id === id ? data.table : t));
      setEditingId(null);
      flash("Table updated.");
    } catch (err) {
      const d = err.response?.data;
      setEditError(d?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  
  const handleDeactivate = async (table) => {
    if (!window.confirm(`Deactivate Table ${table.tableNumber}? It will no longer be bookable.`)) return;
    try {
      await deactivateTable(table._id);
      setTables((prev) => prev.map((t) => t._id === table._id ? { ...t, isActive: false } : t));
      flash(`Table ${table.tableNumber} deactivated.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate table");
    }
  };

  const handleReactivate = async (table) => {
    try {
      const { data } = await updateTable(table._id, { isActive: true });
      setTables((prev) => prev.map((t) => t._id === table._id ? data.table : t));
      flash(`Table ${table.tableNumber} reactivated.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reactivate table");
    }
  };

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title admin-title">Table Management</h1>
          <p className="page-subtitle">Add, edit, and manage restaurant tables</p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {}
      <div className="card admin-card">
        <h2 className="card-title">Add New Table</h2>
        {addError && <div className="alert alert-error">⚠️ {addError}</div>}
        {addErrors.length > 0 && (
          <div className="alert alert-error">
            <ul className="error-list">{addErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form onSubmit={handleAdd} className="inline-form">
          <div className="form-group">
            <label htmlFor="add-table-number" className="form-label">Table number</label>
            <input
              id="add-table-number"
              type="number"
              name="tableNumber"
              value={addForm.tableNumber}
              onChange={handleAddChange}
              className="form-input"
              min={1}
              placeholder="e.g. 9"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-capacity" className="form-label">Capacity</label>
            <select
              id="add-capacity"
              name="capacity"
              value={addForm.capacity}
              onChange={handleAddChange}
              className="form-input form-select"
              required
            >
              <option value="">— seats —</option>
              {VALID_CAPACITIES.map((c) => (
                <option key={c} value={c}>{c} seats</option>
              ))}
            </select>
          </div>
          <button
            id="add-table-submit"
            type="submit"
            className="btn btn-primary"
            disabled={adding}
          >
            {adding ? "Adding…" : "Add Table"}
          </button>
        </form>
      </div>

      {}
      {loading ? (
        <div className="loading-state">Loading tables…</div>
      ) : (
        <div className="table-container">
          <table className="data-table" id="admin-tables-table">
            <thead>
              <tr>
                <th>Table #</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table._id} className={!table.isActive ? "row-cancelled" : ""}>
                  <td><strong>Table {table.tableNumber}</strong></td>
                  <td>
                    {editingId === table._id ? (
                      <select
                        name="capacity"
                        value={editForm.capacity}
                        onChange={handleEditChange}
                        className="form-input form-select form-input-sm"
                        id={`edit-capacity-${table._id}`}
                      >
                        {VALID_CAPACITIES.map((c) => (
                          <option key={c} value={c}>{c} seats</option>
                        ))}
                      </select>
                    ) : (
                      `${table.capacity} seats`
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${table.isActive ? "status-confirmed" : "status-cancelled"}`}>
                      {table.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {editingId === table._id ? (
                      <div className="action-btns">
                        {editError && <span className="inline-error">{editError}</span>}
                        <button
                          id={`save-table-${table._id}`}
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSave(table._id)}
                          disabled={saving}
                        >
                          {saving ? "…" : "Save"}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
                      </div>
                    ) : (
                      <div className="action-btns">
                        <button
                          id={`edit-table-${table._id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(table)}
                        >
                          Edit
                        </button>
                        {table.isActive ? (
                          <button
                            id={`deactivate-table-${table._id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeactivate(table)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            id={`reactivate-table-${table._id}`}
                            className="btn btn-success btn-sm"
                            onClick={() => handleReactivate(table)}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTables;
