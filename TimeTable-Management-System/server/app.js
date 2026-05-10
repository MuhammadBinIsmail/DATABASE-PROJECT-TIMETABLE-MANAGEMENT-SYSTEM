const express = require("express");
const cors = require("cors");
const loadEnv = require("./config/loadEnv");
const apiRoutes = require("./routes");

loadEnv();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "timetable-management-server" });
});

app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});