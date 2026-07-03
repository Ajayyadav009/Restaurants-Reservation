const express = require("express");
const { authenticate } = require("../middlewares/auth");
const {
  getTimeSlots,
  createReservation,
  getMyReservations,
  cancelMyReservation,
} = require("../controllers/reservationController");

const router = express.Router();


router.get("/slots", authenticate, getTimeSlots);


router.get("/my", authenticate, getMyReservations);


router.post("/", authenticate, createReservation);


router.delete("/:id/cancel", authenticate, cancelMyReservation);

module.exports = router;
