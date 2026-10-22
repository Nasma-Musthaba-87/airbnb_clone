const express = require ("express");

const{createReview, getListingReviews, updateReview, deleteReview} = require ("../controllers/reviewController.js");

const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

//Create a review - login required
router.post("/", protect, createReview);

//Get all reviews for a specific listing - public route
router.get("/:listingId", getListingReviews);

//Update your own review - login required
router.put("/:id", protect, updateReview);

//Delete your own review - login required
router.delete("/:id", protect, deleteReview);

module.exports = router;