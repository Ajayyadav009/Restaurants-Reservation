const express = require("express");
const { authenticate } = require("../middlewares/auth");
const { getTables, createTable, updateTable, deactivateTable } = require("../controllers/tableController");

const router = express.Router();


router.get("/", authenticate, getTables);

module.exports = router;
