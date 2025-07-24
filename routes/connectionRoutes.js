const express = require("express");
const router = express.Router();
const {
  deleteConnection,
  createConnection,
  getAllConnections,
  searchConnection,
} = require("../controllers/connectionController");

// MILESTONE 1: Delete connections endpoint
router.delete("/", deleteConnection);

// Get all connections
router.get("/", getAllConnections);

// Add a new connection (for testing)
router.post("/", createConnection);

// MILESTONE 3: BFS search for connections between two users
router.get("/search/:user_id1/:user_id2", searchConnection);

module.exports = router;
