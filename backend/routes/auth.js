const router = require("express").Router();
const { register, login } = require("../controllers/auth");

// Register route
//Tested-Working
router.post("/register", register);

// Login route
//Tested-Working
router.post("/login", login);

module.exports = router;
