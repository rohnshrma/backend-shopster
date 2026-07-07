const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    

} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

//register route
router.post("/register", register);

//login route
router.post("/login", login);

//get user profile route
router.get("/profile", protect, getProfile); 



module.exports = router;