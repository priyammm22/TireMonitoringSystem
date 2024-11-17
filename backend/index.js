const express = require("express");
const { connectDB } = require("./db/db");
const tireRoutes = require("./routes/tireRoutes.js"); // Import tire routes

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use tire routes
app.use("/tire", tireRoutes); // All routes defined in tireRoutes will be prefixed with "/tire"

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
