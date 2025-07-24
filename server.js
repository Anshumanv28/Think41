const express = require("express");
const { initializeDatabase, closeDatabase } = require("./database/database");

// Import routes
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use("/users", userRoutes);
app.use("/user", userRoutes);
app.use("/connection", connectionRoutes);
app.use("/connections", connectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("\nAvailable endpoints:");
  console.log("DELETE /connection - Delete a connection between two users");
  console.log(
    "GET /user/friends/:user_id/friends_of_friends - Get friends of friends"
  );
  console.log(
    "GET /connection/search/:user_id1/:user_id2 - BFS search for connection"
  );
  console.log("\nUtility endpoints:");
  console.log("GET /users - Get all users");
  console.log("GET /connections - Get all connections");
  console.log("POST /connection - Add a new connection");
  console.log("GET /user/:user_id/friends - Get direct friends of a user");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  closeDatabase();
  process.exit(0);
});
