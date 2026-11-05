require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Copy .env.example to .env and set your Neon connection string.");
    process.exit(1);
  }

  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    console.log("Database connected successfully:", result.rows[0].current_time);
  } catch (error) {
    // Only the message is printed, never the connection string
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();
