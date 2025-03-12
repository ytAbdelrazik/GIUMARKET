const router = require("express").Router();
const { register, login } = require("../controllers/auth");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

module.exports = router;
