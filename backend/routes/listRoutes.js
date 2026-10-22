const express = require ("express");

const {createListing, getAllListings, getListingbyId, 
  updateListing, deleteListing, getHostList} = require ("../controllers/listController.js");

const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

//Create a list - login required
router.post("/", protect, createListing);

//Get All Listings - no login required
router.get("/", getAllListings);

//Get all listings for a specific host - login required
router.get("/hostlist", protect, getHostList);

//Get one listing by ID - public route
router.get("/:id", getListingbyId);

//Update a listing - login and ownership required
router.put("/:id", protect, updateListing);

//Delete a listing
router.delete("/:id", protect, deleteListing);

module.exports = router;
