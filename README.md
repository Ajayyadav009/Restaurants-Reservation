# Restaurant Reservation Management System

A full-stack web application for managing restaurant table reservations, built with React (Vite), Node.js + Express, MongoDB, and JWT authentication.

---

## Local Development Setup

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Restaurants_reservation_system
```

### 2. Configure the backend
```bash
cd server
```
Edit `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
NODE_ENV=development
```

### 3. Install server dependencies (already done if you see node_modules)
```bash
npm install
```

### 4. Start the backend
```bash
npm run dev
```
The server starts on `http://localhost:5000`. On first run it automatically seeds 8 default tables into the database.

### 5. Configure the frontend
```bash
cd ../client
```
Edit `.env` (create if missing):
```
VITE_API_URL=http://localhost:5000/api
```

### 6. Install client dependencies
```bash
npm install
```

### 7. Start the frontend
```bash
npm run dev
```
The app opens at `http://localhost:5173`.

### Creating an Admin Account
New accounts created through the UI are always `customer` role. To create an admin, either:
1. Register a normal account, then update the `role` field to `"admin"` directly in MongoDB Atlas.
2. Or add a seed script.

---

## Project Structure

```
Restaurants_reservation_system/
├── server/
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── controllers/    # Business logic handlers
│       ├── middlewares/    # Auth + error handler
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routers
│       ├── seed/           # Table seeder
│       ├── utilis/         # AppError class, TIME_SLOTS constant
│       └── validators/     # Input validation functions
└── client/
    └── src/
        ├── api/            # Axios instance + resource wrappers
        ├── components/     # Navbar, ProtectedRoute
        ├── context/        # AuthContext (JWT + user state)
        └── pages/
            ├── auth/       # Login, Register
            ├── customer/   # MyReservations, NewReservation
            └── admin/      # AdminReservations, AdminTables
```

---

## Assumptions Made

1. **Single restaurant**: No multi-location support; all tables belong to one restaurant.
2. **Fixed capacity values**: Tables can only have capacities of 2, 4, 6, or 8 seats.
3. **Time slots are fixed**: The system uses 8 predefined slots (4 lunch, 4 dinner). This makes conflict detection unambiguous — no overlapping ranges to reason about.
4. **Date normalisation**: All dates are stored at midnight UTC (`setUTCHours(0,0,0,0)`). A reservation for "July 4" is stored as `2024-07-04T00:00:00.000Z` regardless of the client's timezone.
5. **No same-day past-slot validation**: The system rejects bookings on past *dates*, but does not check whether a time slot has already passed for *today* (e.g. booking 12:00–13:00 at 14:00 today is allowed). This was omitted to keep the logic simple.
6. **Admin creation**: Admin accounts are not created through the public UI — they must be assigned manually in the database.

---

## Reservation & Availability/Conflict Logic

### The Core Query
Before any reservation is created or updated, the system runs:

```javascript
const conflict = await Reservation.findOne({
  table: tableId,
  date: normalizedDate,    // midnight UTC
  timeSlot: timeSlot,
  status: "confirmed",     // cancelled slots are free again
  _id: { $ne: excludeId } // when updating, exclude the reservation itself
});
if (conflict) throw new AppError("This table is already booked for that time slot", 409);
```

This query uses a **compound index** on `{ table, date, timeSlot, status }`, making it O(log n) — fast even as reservations grow.

### Why cancellation frees the slot
The query filters `status: "confirmed"`. When a reservation is cancelled, its status changes to `"cancelled"`, so it's invisible to the conflict check. The next booking for that table/date/slot succeeds.

### Capacity enforcement
Checked immediately before the conflict check:
```javascript
if (guests > table.capacity) {
  throw new AppError(`This table only seats ${table.capacity} guests`, 400);
}
```

### Frontend availability annotation
When a customer selects a date + time slot, the frontend calls `GET /api/tables?date=YYYY-MM-DD&timeSlot=HH:MM-HH:MM`. The backend queries all confirmed reservations for that slot and annotates each table with `isAvailable: true/false`. Booked or too-small tables are greyed out in the UI — a second layer of UX protection on top of the backend enforcement.

---

## Role-Based Access Control

### Architecture
RBAC is enforced at the **API level** via Express middleware, not just the UI.

```
authenticate   → verifies Bearer JWT, populates req.user
authorize('admin') → checks req.user.role === 'admin', returns 403 if not
```

All admin routes use `router.use(authenticate, authorize('admin'))`, so every single route in `/api/admin/*` requires a valid admin JWT — no exceptions.

### Route permissions

| Route | Auth required | Role required |
|---|---|---|
| `POST /api/auth/register` | No | — |
| `POST /api/auth/login` | No | — |
| `GET /api/auth/me` | Yes | Any |
| `GET /api/tables` | Yes | Any |
| `GET /api/reservations/slots` | Yes | Any |
| `GET /api/reservations/my` | Yes | Any |
| `POST /api/reservations` | Yes | Any (ownership enforced) |
| `DELETE /api/reservations/:id/cancel` | Yes | Own reservation only |
| `GET /api/admin/reservations` | Yes | Admin |
| `PATCH /api/admin/reservations/:id` | Yes | Admin |
| `DELETE /api/admin/reservations/:id/cancel` | Yes | Admin |
| `GET /api/admin/tables` | Yes | Admin |
| `POST /api/admin/tables` | Yes | Admin |
| `PATCH /api/admin/tables/:id` | Yes | Admin |
| `DELETE /api/admin/tables/:id` | Yes | Admin |

### Frontend route guarding
`ProtectedRoute` reads from `AuthContext` and redirects unauthenticated users to `/login`, or users with the wrong role to `/403`. This is a UX layer — the API would reject the request anyway.

---

## Known Limitations

1. **No same-day time-of-day validation** — see Assumptions #5.
2. **No refresh tokens** — JWTs expire after 7 days and are not automatically refreshed.
3. **No pagination** — the admin reservations table loads all records. For large datasets, server-side pagination should be added.
4. **No email confirmation** — out of scope per the spec.
5. **Admin creation is manual** — requires direct database access.

---

## What I'd Improve With More Time

1. **Pagination & search** on the admin reservations table.
2. **Refresh token rotation** for longer sessions without security tradeoffs.
3. **Admin user management UI** — promote/demote users without DB access.
4. **Unit tests** for the conflict detection logic (`findConflict`) and capacity enforcement.
5. **Integration tests** for the full booking flow using supertest + a test DB.
6. **Rate limiting** on auth endpoints to prevent brute force attacks.
7. **Audit log** — track who cancelled/modified a reservation and when.
8. **Reservation editing for customers** — currently customers can only cancel; allowing date/slot changes would improve UX.
