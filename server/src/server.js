const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const testRoutes = require("./routes/testRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api", analyzeRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});