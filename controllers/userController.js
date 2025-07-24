const { getDatabase } = require("../database/database");

// Get all users
const getAllUsers = (req, res) => {
  const db = getDatabase();
  db.all("SELECT * FROM users ORDER BY user_id", [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
};

// Get direct friends of a user
const getUserFriends = (req, res) => {
  const userId = parseInt(req.params.user_id);
  const db = getDatabase();

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  const query = `
        SELECT DISTINCT 
            CASE 
                WHEN user_id1 = ? THEN user_id2 
                ELSE user_id1 
            END as friend_id,
            u.user_name
        FROM connections c
        INNER JOIN users u ON (
            CASE 
                WHEN c.user_id1 = ? THEN c.user_id2 
                ELSE c.user_id1 
            END = u.user_id
        )
        WHERE user_id1 = ? OR user_id2 = ?
        ORDER BY u.user_name
    `;

  db.all(query, [userId, userId, userId, userId], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      user_id: userId,
      friends: rows,
    });
  });
};

// MILESTONE 2: Get friends of friends endpoint
const getFriendsOfFriends = (req, res) => {
  const userId = parseInt(req.params.user_id);
  const db = getDatabase();

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  // SQL query to get friends of friends excluding the base user and direct friends
  const query = `
        WITH DirectFriends AS (
            SELECT CASE 
                WHEN user_id1 = ? THEN user_id2 
                ELSE user_id1 
            END as friend_id
            FROM connections 
            WHERE user_id1 = ? OR user_id2 = ?
        ),
        FriendsOfFriends AS (
            SELECT DISTINCT CASE 
                WHEN c.user_id1 = df.friend_id THEN c.user_id2 
                ELSE c.user_id1 
            END as friend_of_friend_id
            FROM connections c
            INNER JOIN DirectFriends df ON (c.user_id1 = df.friend_id OR c.user_id2 = df.friend_id)
            WHERE (c.user_id1 = df.friend_id OR c.user_id2 = df.friend_id)
        )
        SELECT DISTINCT fof.friend_of_friend_id as user_id, u.user_name
        FROM FriendsOfFriends fof
        INNER JOIN users u ON fof.friend_of_friend_id = u.user_id
        WHERE fof.friend_of_friend_id != ?
        AND fof.friend_of_friend_id NOT IN (SELECT friend_id FROM DirectFriends)
        ORDER BY u.user_name
    `;

  db.all(query, [userId, userId, userId, userId], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      user_id: userId,
      friends_of_friends: rows,
    });
  });
};

module.exports = {
  getAllUsers,
  getUserFriends,
  getFriendsOfFriends,
};
