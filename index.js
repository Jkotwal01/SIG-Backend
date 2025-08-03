require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// for API documentation...
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("swagger.yaml");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection with error handling
mongoose
  .connect("mongodb://127.0.0.1:27017/miniproject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// Routes
app.use("/", require("./routes/api"));

// for API Doucumentaion
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Server start with error handling
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
