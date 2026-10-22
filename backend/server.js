const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const{notFound, errorHandler} = require("./middleware/errorMiddleware.js");
const protect = require ("./middleware/authMiddleware.js");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

//Connect to MongoDB
connectDB();

//Middleware
app.use(cors({origin: "http://localhost:5173"})); // Enable CORS for all routes
app.use(express.json());

//Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Airbnb Clone application is running!",
  });
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

//Error handling middleware
app.use(notFound);
app.use(errorHandler);

//Start the server
app.listen(PORT,() => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/auth/profile", protect, (req,res) => {
  res.status(200).json({
    message:"You accessed a protected route successsfully",
    user: req.user,
  });
});

