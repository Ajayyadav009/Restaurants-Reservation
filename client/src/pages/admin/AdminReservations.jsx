import { useState, useEffect, useCallback } from "react";
import { getAllReservations, adminUpdateReservation, adminCancelReservation } from "../../api/reservations";
import { getTimeSlots } from "../../api/reservations";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const todayStr = () => new Date().toISOString().split("T")[0];

const EditModal = ({ reservation, timeSlots, onSave, onClose }) => {
  const [form, setForm] = useState({
    date: reservation.date.split("T")[0],
    timeSlot: reservation.timeSlot,
    guests: reservation.guests,
    status: reservation.status,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(reservation._id, {
        date: form.date,
        timeSlot: form.timeSlot,
        guests: Number(form.guests),
        status: form.status,
      });
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) setFieldErrors(data.errors);
      else setError(data?.message || "Failed to update reservation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title">Edit Reservation</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {fieldErrors.length > 0 && (
          <div className="alert alert-error">
            <ul className="error-list">{fieldErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <label htmlFor="edit-date" className="form-label">Date</label>
            <input id="edit-date" type="date" name="date" value={form.date} onChange={handleChange} className="form-input" min={todayStr()} required />
          </div>
          <div className="form-group">
            <label htmlFor="edit-timeslot" className="form-label">Time Slot</label>
            <select id="edit-timeslot" name="timeSlot" value={form.timeSlot} onChange={handleChange} className="form-input form-select" required>
              {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-guests" className="form-label">Guests</label>
            <input id="edit-guests" type="number" name="guests" value={form.guests} onChange={handleChange} className="form-input" min={1} max={8} required />
          </div>
          <div className="form-group">
            <label htmlFor="edit-status" className="form-label">Status</label>
            <select id="edit-status" name="status" value={form.status} onChange={handleChange} className="form-input form-select">
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button id="edit-save-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await getAllReservations(params);
      setReservations(data.reservations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);
  useEffect(() => {
    getTimeSlots().then(({ data }) => setTimeSlots(data.timeSlots)).catch(() => {});
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setCancellingId(id);
    try {
      await adminCancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => r._id === id ? { ...r, status: "cancelled" } : r)
      );
      flash("Reservation cancelled.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  const handleSave = async (id, updates) => {
    const { data } = await adminUpdateReservation(id, updates);
    setReservations((prev) =>
      prev.map((r) => r._id === id ? data.reservation : r)
    );
    flash("Reservation updated.");
  };

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="page-title admin-title">All Reservations</h1>
          <p className="page-subtitle">Manage all customer reservations</p>
        </div>
      </div>

      {}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="filter-date" className="form-label">Filter by date</label>
          <input
            id="filter-date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input filter-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filter-status" className="form-label">Filter by status</label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input form-select filter-input"
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button
            className="btn btn-outline btn-sm filter-clear"
            onClick={() => { setDateFilter(""); setStatusFilter(""); }}
          >
            Clear filters
          </button>
        )}
      </div>

      {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="loading-state">Loading reservations…</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>No reservations found{dateFilter ? ` for ${dateFilter}` : ""}.</p>
        </div>
      ) : (
        <>
          <p className="results-count">{reservations.length} reservation{reservations.length !== 1 ? "s" : ""}</p>
          <div className="table-container">
            <table className="data-table" id="admin-reservations-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Table</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} className={r.status === "cancelled" ? "row-cancelled" : ""}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{r.user?.name}</span>
                        <span className="customer-email">{r.user?.email}</span>
                      </div>
                    </td>
                    <td>{formatDate(r.date)}</td>
                    <td><span className="time-slot-badge">{r.timeSlot}</span></td>
                    <td>Table {r.table?.tableNumber} <span className="capacity-hint">(seats {r.table?.capacity})</span></td>
                    <td>{r.guests}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          id={`edit-btn-${r._id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingReservation(r)}
                        >
                          Edit
                        </button>
                        {r.status === "confirmed" && (
                          <button
                            id={`admin-cancel-btn-${r._id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(r._id)}
                            disabled={cancellingId === r._id}
                          >
                            {cancellingId === r._id ? "…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingReservation && (
        <EditModal
          reservation={editingReservation}
          timeSlots={timeSlots}
          onSave={handleSave}
          onClose={() => setEditingReservation(null)}
        />
      )}
    </div>
  );
};

export default AdminReservations;
