const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const { getAllUsers } = require("../controllers/adminController");
const {
  getAllReservations,
  adminUpdateReservation,
  adminCancelReservation,
} = require("../controllers/reservationController");
const {
  createTable,
  updateTable,
  deactivateTable,
  getAllTablesAdmin,
} = require("../controllers/tableController");

const router = express.Router();


router.use(authenticate, authorize("admin"));



router.get("/users", getAllUsers);



router.get("/reservations", getAllReservations);


router.patch("/reservations/:id", adminUpdateReservation);


router.delete("/reservations/:id/cancel", adminCancelReservation);



router.get("/tables", getAllTablesAdmin);


router.post("/tables", createTable);


router.patch("/tables/:id", updateTable);


router.delete("/tables/:id", deactivateTable);

module.exports = router;
