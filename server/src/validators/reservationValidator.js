const TIME_SLOTS = require("../utilis/timeSlots");


const validateCreateReservation = (body) => {
  const errors = [];
  const { tableId, date, timeSlot, guests } = body;

  if (!tableId || typeof tableId !== "string" || tableId.trim().length === 0) {
    errors.push("A table must be selected");
  }

  if (!date) {
    errors.push("Reservation date is required");
  } else {
    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      errors.push("Invalid date format");
    } else {
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      reservationDate.setHours(0, 0, 0, 0);
      if (reservationDate < today) {
        errors.push("Reservation date cannot be in the past");
      }
    }
  }

  if (!timeSlot || !TIME_SLOTS.includes(timeSlot)) {
    errors.push(`Time slot must be one of: ${TIME_SLOTS.join(", ")}`);
  }

  if (guests === undefined || guests === null) {
    errors.push("Number of guests is required");
  } else {
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      errors.push("Number of guests must be a positive integer");
    }
  }

  return { isValid: errors.length === 0, errors };
};


const validateUpdateReservation = (body) => {
  const errors = [];
  const { date, timeSlot, guests, status } = body;

  if (date !== undefined) {
    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      errors.push("Invalid date format");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      reservationDate.setHours(0, 0, 0, 0);
      if (reservationDate < today) {
        errors.push("Reservation date cannot be in the past");
      }
    }
  }

  if (timeSlot !== undefined && !TIME_SLOTS.includes(timeSlot)) {
    errors.push(`Time slot must be one of: ${TIME_SLOTS.join(", ")}`);
  }

  if (guests !== undefined) {
    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      errors.push("Number of guests must be a positive integer");
    }
  }

  if (status !== undefined && !["confirmed", "cancelled"].includes(status)) {
    errors.push("Status must be 'confirmed' or 'cancelled'");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateCreateReservation, validateUpdateReservation };
