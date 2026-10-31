const express = require("express");
const {registerUser, loginUser, becomeHost} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware")
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.patch("/becomeHost",protect,becomeHost)
router.get("/profile", protect, (req,res) => {
  res.status(200).json({
    message:"You accessed a protected route successfully",
    user: req.user,
  });
});

module. exports = router;