const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const AppError = require("../utilis/AppError");
const { validateCreateTable, validateUpdateTable } = require("../validators/tableValidator");


const getTables = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.query;

    const tables = await Table.find({ isActive: true }).sort({ tableNumber: 1 });

    
    if (date && timeSlot) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const bookedReservations = await Reservation.find({
        date: { $gte: queryDate, $lt: nextDay },
        timeSlot,
        status: "confirmed",
      }).select("table");

      const bookedTableIds = new Set(bookedReservations.map((r) => r.table.toString()));

      const tablesWithAvailability = tables.map((t) => ({
        ...t.toObject(),
        isAvailable: !bookedTableIds.has(t._id.toString()),
      }));

      return res.status(200).json({ success: true, tables: tablesWithAvailability });
    }

    return res.status(200).json({ success: true, tables });
  } catch (error) {
    next(error);
  }
};


const createTable = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateTable(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const { tableNumber, capacity } = req.body;

    const existing = await Table.findOne({ tableNumber: Number(tableNumber) });
    if (existing) {
      return next(new AppError(`Table ${tableNumber} already exists`, 409));
    }

    const table = await Table.create({ tableNumber: Number(tableNumber), capacity: Number(capacity) });

    return res.status(201).json({ success: true, table });
  } catch (error) {
    next(error);
  }
};


const updateTable = async (req, res, next) => {
  try {
    const { isValid, errors } = validateUpdateTable(req.body);
    if (!isValid) {
      return next(new AppError("Validation failed", 400, errors));
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return next(new AppError("Table not found", 404));
    }

    const { capacity, isActive } = req.body;
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();

    return res.status(200).json({ success: true, table });
  } catch (error) {
    next(error);
  }
};


const deactivateTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return next(new AppError("Table not found", 404));
    }

    table.isActive = false;
    await table.save();

    return res.status(200).json({ success: true, message: `Table ${table.tableNumber} has been deactivated` });
  } catch (error) {
    next(error);
  }
};


const getAllTablesAdmin = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return res.status(200).json({ success: true, tables });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTables, createTable, updateTable, deactivateTable, getAllTablesAdmin };
