const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const tableRoutes = require("./routes/tableRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();


const corsOptions = {
  origin: (origin, callback) => {
    
    if (!origin) return callback(null, true);

    
    if (process.env.NODE_ENV === "production") {
      const allowedOrigin = process.env.CLIENT_URL || "https://restaurants-reservation-1.onrender.com";
      if (origin === allowedOrigin) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`), false);
    }

    
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin ${origin} not allowed`), false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.json({ success: true, message: "Restaurant Reservation API", version: "1.0.0" });
});


app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});


app.use(errorHandler);

module.exports = app;