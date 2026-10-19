const express = require("express");
const { analyzeRepository } = require("../controllers/analyzecontroller");

const router = express.Router();
console.log("analyzeRepository:", analyzeRepository);
console.log("type:", typeof analyzeRepository);

router.post("/analyze", analyzeRepository);

module.exports = router;