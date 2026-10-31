const cors = require("cors");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const{notFound, errorHandler} = require("./middleware/errorMiddleware.js");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({origin: ["http://localhost:5173", "http://localhost:5174", "https://airbnb-clone-t9fr.onrender.com",],
  credentials: true
}));

app.use(express.json());


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Airbnb Clone application is running!",
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);


app.use(notFound);
app.use(errorHandler);


app.listen(PORT,() => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
