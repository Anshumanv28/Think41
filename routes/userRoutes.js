const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserFriends,
  getFriendsOfFriends,
} = require("../controllers/userController");

// Get all users
router.get("/", getAllUsers);

// Get direct friends of a user
router.get("/:user_id/friends", getUserFriends);

// MILESTONE 2: Get friends of friends endpoint
router.get("/friends/:user_id/friends_of_friends", getFriendsOfFriends);

module.exports = router;
