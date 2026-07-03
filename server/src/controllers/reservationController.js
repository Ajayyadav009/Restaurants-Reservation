const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const AppError = require("../utilis/AppError");
const TIME_SLOTS = require("../utilis/timeSlots");
const {
  validateCreateReservation,
  validateUpdateReservation,
} = require("../validators/reservationValidator");

const normalizeDate = (rawDate) => {
  const d = new Date(rawDate);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const findConflict = async (tableId, date, timeSlot, excludeReservationId = null) => {
  const query = {
    table: tableId,
    date,
    timeSlot,
    status: "confirmed",
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  return Reservation.findOne(query);
};

const getTimeSlots = (req, res) => {
  return res.status(200).json({ success: true, timeSlots: TIME_SLOTS });
};

const createReservation = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateReservation(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const { tableId, date, timeSlot, guests } = req.body;
    const guestCount = Number(guests);
    const normalizedDate = normalizeDate(date);

    const table = await Table.findById(tableId);
    if (!table) {
      return next(new AppError("Table not found", 404));
    }
    if (!table.isActive) {
      return next(new AppError("This table is not available for booking", 400));
    }
    if (guestCount > table.capacity) {
      return next(
        new AppError(
          `This table only seats ${table.capacity} guest${table.capacity > 1 ? "s" : ""}. You requested ${guestCount}.`,
          400
        )
      );
    }

    const conflict = await findConflict(tableId, normalizedDate, timeSlot);
    if (conflict) {
      return next(
        new AppError(
          "This table is already booked for that date and time slot. Please choose a different table or time.",
          409
        )
      );
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date: normalizedDate,
      timeSlot,
      guests: guestCount,
    });

    await reservation.populate([
      { path: "table", select: "tableNumber capacity" },
      { path: "user", select: "name email" },
    ]);

    return res.status(201).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate("table", "tableNumber capacity")
      .sort({ date: -1, timeSlot: 1 });

    return res.status(200).json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
};

const cancelMyReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return next(new AppError("Reservation not found", 404));
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return next(new AppError("You can only cancel your own reservations", 403));
    }

    if (reservation.status === "cancelled") {
      return next(new AppError("This reservation is already cancelled", 400));
    }

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReservations = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) {
      const queryDate = normalizeDate(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: queryDate, $lt: nextDay };
    }

    if (status && ["confirmed", "cancelled"].includes(status)) {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate("user", "name email")
      .populate("table", "tableNumber capacity")
      .sort({ date: -1, timeSlot: 1 });

    return res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    next(error);
  }
};

const adminUpdateReservation = async (req, res, next) => {
  try {
    const { isValid, errors } = validateUpdateReservation(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError("Reservation not found", 404));
    }

    const { date, timeSlot, guests, status, tableId } = req.body;

    const effectiveTableId = tableId || reservation.table.toString();
    const effectiveDate = date ? normalizeDate(date) : reservation.date;
    const effectiveTimeSlot = timeSlot || reservation.timeSlot;
    const effectiveGuests = guests !== undefined ? Number(guests) : reservation.guests;

    const bookingFieldsChanged =
      tableId || date !== undefined || timeSlot !== undefined || guests !== undefined;

    if (bookingFieldsChanged && status !== "cancelled") {
      const table = await Table.findById(effectiveTableId);
      if (!table) {
        return next(new AppError("Table not found", 404));
      }
      if (!table.isActive) {
        return next(new AppError("This table is not available for booking", 400));
      }
      if (effectiveGuests > table.capacity) {
        return next(
          new AppError(
            `This table only seats ${table.capacity} guest${table.capacity > 1 ? "s" : ""}`,
            400
          )
        );
      }

      const conflict = await findConflict(
        effectiveTableId,
        effectiveDate,
        effectiveTimeSlot,
        reservation._id
      );
      if (conflict) {
        return next(
          new AppError(
            "This table is already booked for that date and time slot",
            409
          )
        );
      }
    }

    if (tableId) reservation.table = tableId;
    if (date !== undefined) reservation.date = effectiveDate;
    if (timeSlot !== undefined) reservation.timeSlot = effectiveTimeSlot;
    if (guests !== undefined) reservation.guests = effectiveGuests;
    if (status !== undefined) reservation.status = status;

    await reservation.save();
    await reservation.populate([
      { path: "user", select: "name email" },
      { path: "table", select: "tableNumber capacity" },
    ]);

    return res.status(200).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
};

const adminCancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError("Reservation not found", 404));
    }

    if (reservation.status === "cancelled") {
      return next(new AppError("This reservation is already cancelled", 400));
    }

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeSlots,
  createReservation,
  getMyReservations,
  cancelMyReservation,
  getAllReservations,
  adminUpdateReservation,
  adminCancelReservation,
};
