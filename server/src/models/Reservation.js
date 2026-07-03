const mongoose = require("mongoose");
const TIME_SLOTS = require("../utilis/timeSlots");

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Table reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      enum: {
        values: TIME_SLOTS,
        message: "Invalid time slot",
      },
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest is required"],
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);


reservationSchema.index({ table: 1, date: 1, timeSlot: 1, status: 1 });


reservationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
