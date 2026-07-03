const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const seedTables = require("./seed/seedTables");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  
  await connectDB();
  await seedTables();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();