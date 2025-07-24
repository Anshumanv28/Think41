const sqlite3 = require("sqlite3").verbose();
const path = require("path");

let db = null;

// Database setup and initialization
const initializeDatabase = () => {
  const dbPath = path.join(__dirname, "..", "connections.db");
  db = new sqlite3.Database(dbPath);

  // Initialize database tables
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_name TEXT NOT NULL UNIQUE
      )`);

    // Create connections table
    db.run(`CREATE TABLE IF NOT EXISTS connections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id1 INTEGER NOT NULL,
          user_id2 INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id1) REFERENCES users(user_id),
          FOREIGN KEY (user_id2) REFERENCES users(user_id),
          UNIQUE(user_id1, user_id2)
      )`);

    // Insert some sample data for testing
    db.run(`INSERT OR IGNORE INTO users (user_name) VALUES 
          ('Alice'), ('Bob'), ('Charlie'), ('David'), ('Eve'), ('Frank')`);

    db.run(`INSERT OR IGNORE INTO connections (user_id1, user_id2) VALUES 
          (1, 2), (1, 3), (2, 4), (3, 5), (4, 6), (5, 6)`);
  });

  return db;
};

// Get database instance
const getDatabase = () => {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
};

// Close database connection
const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
};
