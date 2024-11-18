const express = require("express");
const { connectDB } = require("./db/db");
const tireRoutes = require("./routes/tireRoutes.js");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 


connectDB();

app.use("/tire", tireRoutes); 

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
