const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, "Table number is required"],
      unique: true,
      min: [1, "Table number must be at least 1"],
    },
    capacity: {
      type: Number,
      required: [true, "Seating capacity is required"],
      enum: {
        values: [2, 4, 6, 8],
        message: "Capacity must be 2, 4, 6, or 8",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
