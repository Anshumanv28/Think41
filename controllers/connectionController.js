const { getDatabase } = require("../database/database");

// Helper function to ensure consistent ordering of user IDs in connections
function normalizeConnection(user_id1, user_id2) {
  return user_id1 < user_id2 ? [user_id1, user_id2] : [user_id2, user_id1];
}

// MILESTONE 1: Delete connections
const deleteConnection = (req, res) => {
  const { user_id1, user_id2 } = req.body;
  const db = getDatabase();

  if (!user_id1 || !user_id2) {
    return res.status(400).json({
      error: "Both user_id1 and user_id2 are required",
    });
  }

  if (user_id1 === user_id2) {
    return res.status(400).json({
      error: "user_id1 and user_id2 cannot be the same",
    });
  }

  const [normalizedId1, normalizedId2] = normalizeConnection(
    user_id1,
    user_id2
  );

  const deleteQuery = `
        DELETE FROM connections 
        WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)
    `;

  db.run(deleteQuery, [user_id1, user_id2, user_id2, user_id1], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Connection not found between the specified users",
      });
    }

    res.json({
      message: "Connection deleted successfully",
      deleted_connection: { user_id1, user_id2 },
    });
  });
};

// Add a new connection (for testing)
const createConnection = (req, res) => {
  const { user_id1, user_id2 } = req.body;
  const db = getDatabase();

  if (!user_id1 || !user_id2) {
    return res.status(400).json({
      error: "Both user_id1 and user_id2 are required",
    });
  }

  if (user_id1 === user_id2) {
    return res.status(400).json({
      error: "user_id1 and user_id2 cannot be the same",
    });
  }

  const insertQuery = `
        INSERT INTO connections (user_id1, user_id2) VALUES (?, ?)
    `;

  db.run(insertQuery, [user_id1, user_id2], function (err) {
    if (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({
          error: "Connection already exists or invalid user IDs",
        });
      }
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      message: "Connection created successfully",
      connection_id: this.lastID,
      connection: { user_id1, user_id2 },
    });
  });
};

// Get all connections
const getAllConnections = (req, res) => {
  const db = getDatabase();
  const query = `
        SELECT c.*, u1.user_name as user1_name, u2.user_name as user2_name
        FROM connections c
        JOIN users u1 ON c.user_id1 = u1.user_id
        JOIN users u2 ON c.user_id2 = u2.user_id
        ORDER BY c.id
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
};

// MILESTONE 3: BFS search for connections between two users
const searchConnection = (req, res) => {
  const userId1 = parseInt(req.params.user_id1);
  const userId2 = parseInt(req.params.user_id2);
  const db = getDatabase();

  if (!userId1 || !userId2 || isNaN(userId1) || isNaN(userId2)) {
    return res.status(400).json({ error: "Invalid user IDs" });
  }

  if (userId1 === userId2) {
    return res.json({ depth: 0, connection: "same_user" });
  }

  // First, get all connections to build the graph
  const getAllConnectionsQuery = `
        SELECT user_id1, user_id2 FROM connections
    `;

  db.all(getAllConnectionsQuery, [], (err, connections) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Build adjacency list
    const graph = {};
    connections.forEach((conn) => {
      if (!graph[conn.user_id1]) graph[conn.user_id1] = [];
      if (!graph[conn.user_id2]) graph[conn.user_id2] = [];

      graph[conn.user_id1].push(conn.user_id2);
      graph[conn.user_id2].push(conn.user_id1);
    });

    // BFS to find shortest path
    function bfsSearch(start, target) {
      if (!graph[start]) return -1; // Start user has no connections

      const queue = [[start, 0]]; // [user_id, depth]
      const visited = new Set([start]);

      while (queue.length > 0) {
        const [currentUser, depth] = queue.shift();

        if (currentUser === target) {
          return depth;
        }

        // Explore neighbors
        if (graph[currentUser]) {
          for (const neighbor of graph[currentUser]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push([neighbor, depth + 1]);
            }
          }
        }
      }

      return -1; // No connection found
    }

    const depth = bfsSearch(userId1, userId2);

    if (depth === -1) {
      res.json({ depth: -1, connection: "not_found" });
    } else {
      res.json({ depth: depth, connection: "found" });
    }
  });
};

module.exports = {
  deleteConnection,
  createConnection,
  getAllConnections,
  searchConnection,
};
