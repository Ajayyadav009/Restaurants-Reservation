import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyReservations, cancelMyReservation } from "../../api/reservations";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
};

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data } = await getMyReservations();
      setReservations(data.reservations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      setCancellingId(id);
      await cancelMyReservation(id);
      setSuccessMsg("Reservation cancelled successfully.");
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "cancelled" } : r))
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Reservations</h1>
        <Link to="/reservations/new" className="btn btn-primary">
          + New Booking
        </Link>
      </div>

      {successMsg && (
        <div className="alert alert-success" role="status">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="alert alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading your reservations…</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <p>You have no reservations yet.</p>
          <Link to="/reservations/new" className="btn btn-primary">
            Make your first booking
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table" id="my-reservations-table">
            <thead>
              <tr>
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
                  <td>{formatDate(r.date)}</td>
                  <td>
                    <span className="time-slot-badge">{r.timeSlot}</span>
                  </td>
                  <td>Table {r.table?.tableNumber} <span className="capacity-hint">(seats {r.table?.capacity})</span></td>
                  <td>{r.guests}</td>
                  <td>
                    <span className={`status-badge status-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "confirmed" && (
                      <button
                        id={`cancel-btn-${r._id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(r._id)}
                        disabled={cancellingId === r._id}
                      >
                        {cancellingId === r._id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                    {r.status === "cancelled" && (
                      <span className="text-muted">—</span>
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

export default MyReservations;
