import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTimeSlots } from "../../api/reservations";
import { getTables } from "../../api/tables";
import { createReservation } from "../../api/reservations";


const todayStr = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const NewReservation = () => {
  const navigate = useNavigate();

  const [timeSlots, setTimeSlots] = useState([]);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({
    date: "",
    timeSlot: "",
    tableId: "",
    guests: 1,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  
  useEffect(() => {
    getTimeSlots()
      .then(({ data }) => setTimeSlots(data.timeSlots))
      .catch(() => setError("Failed to load time slots"));
  }, []);

  
  useEffect(() => {
    if (!form.date || !form.timeSlot) {
      setTables([]);
      setForm((prev) => ({ ...prev, tableId: "" }));
      return;
    }

    setLoadingTables(true);
    setForm((prev) => ({ ...prev, tableId: "" })); 
    getTables({ date: form.date, timeSlot: form.timeSlot })
      .then(({ data }) => setTables(data.tables))
      .catch(() => setError("Failed to load table availability"))
      .finally(() => setLoadingTables(false));
  }, [form.date, form.timeSlot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors([]);

    try {
      await createReservation({
        tableId: form.tableId,
        date: form.date,
        timeSlot: form.timeSlot,
        guests: Number(form.guests),
      });
      navigate("/reservations", {
        state: { success: "Your reservation has been confirmed!" },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || "Failed to create reservation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedTable = tables.find((t) => t._id === form.tableId);

  return (
    <div className="page-container page-narrow">
      <div className="page-header">
        <h1 className="page-title">New Reservation</h1>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}
      {fieldErrors.length > 0 && (
        <div className="alert alert-error" role="alert">
          <ul className="error-list">
            {fieldErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="reservation-form">

          {}
          <div className="form-section">
            <h2 className="form-section-title">1. Choose a date</h2>
            <div className="form-group">
              <label htmlFor="res-date" className="form-label">Reservation date</label>
              <input
                id="res-date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="form-input"
                min={todayStr()}
                required
              />
            </div>
          </div>

          {}
          <div className="form-section">
            <h2 className="form-section-title">2. Choose a time slot</h2>
            <div className="form-group">
              <label htmlFor="res-timeslot" className="form-label">Time slot</label>
              <select
                id="res-timeslot"
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                className="form-input form-select"
                required
                disabled={!form.date}
              >
                <option value="">— select a time slot —</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {!form.date && (
                <p className="form-hint">Please choose a date first</p>
              )}
            </div>
          </div>

          {}
          <div className="form-section">
            <h2 className="form-section-title">3. Number of guests</h2>
            <div className="form-group">
              <label htmlFor="res-guests" className="form-label">Guests</label>
              <input
                id="res-guests"
                type="number"
                name="guests"
                value={form.guests}
                onChange={handleChange}
                className="form-input"
                min={1}
                max={8}
                required
              />
            </div>
          </div>

          {}
          <div className="form-section">
            <h2 className="form-section-title">4. Choose a table</h2>
            {loadingTables ? (
              <div className="loading-state">Checking availability…</div>
            ) : !form.date || !form.timeSlot ? (
              <p className="form-hint">Select a date and time slot to see available tables</p>
            ) : tables.length === 0 ? (
              <div className="alert alert-info">
                No tables are available for that date and time slot.
              </div>
            ) : (
              <div className="table-grid" role="group" aria-label="Available tables">
                {tables.map((table) => (
                  <label
                    key={table._id}
                    className={`table-card ${!table.isAvailable ? "table-card-unavailable" : ""} ${form.tableId === table._id ? "table-card-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="tableId"
                      value={table._id}
                      checked={form.tableId === table._id}
                      onChange={handleChange}
                      disabled={!table.isAvailable || Number(form.guests) > table.capacity}
                      className="table-radio"
                    />
                    <div className="table-card-content">
                      <span className="table-number">Table {table.tableNumber}</span>
                      <span className="table-capacity">Seats {table.capacity}</span>
                      {!table.isAvailable && (
                        <span className="table-status-label table-booked">Booked</span>
                      )}
                      {table.isAvailable && Number(form.guests) > table.capacity && (
                        <span className="table-status-label table-too-small">Too small</span>
                      )}
                      {table.isAvailable && Number(form.guests) <= table.capacity && (
                        <span className="table-status-label table-available">Available</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {selectedTable && (
              <p className="form-hint selection-summary">
                Selected: <strong>Table {selectedTable.tableNumber}</strong> (seats {selectedTable.capacity})
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              id="reserve-submit"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || !form.tableId || !form.date || !form.timeSlot}
            >
              {loading ? "Booking…" : "Confirm reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReservation;
