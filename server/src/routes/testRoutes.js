const express = require("express");
const testController = require("../controllers/testcontroller");

const router = express.Router();

router.get("/", testController);

module.exports = router;