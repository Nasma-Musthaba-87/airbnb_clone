const Listing = require ("../models/listing.js");
const Review = require ("../models/review.js");
const Booking = require("../models/booking.js");

const createListing = async (req,res) => {
  try{
    const{
      title,
      description,
      location,
      priceperNight,
      bedrooms,
      maxGuests,
      images,
    } = req.body;

    
    if(
      !title ||
      !description ||
      !location ||
      priceperNight == null ||
      bedrooms == null ||
      maxGuests == null
    ) {
      return res.status(400).json({
        message: "Please provide all require listing fields",
      });
    }

    console.log("Authenticate user:", req.user)
    
    const listing = await Listing.create({
      title,
      description,
      location,
      priceperNight,
      bedrooms,
      maxGuests,
      images,
      host: req.user.userId,
    });

    res.status(201).json({
      message: "Listing created successfully",
      listing,
    });

  }catch (error) {
    res.status(500).json({
      message: "Failed to create listing",
      error: error.message,
    });
  }
};


const getAllListings = async (req,res) => {
  try{
    const {
      location,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      checkIn,
      checkOut,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (location) {
      const safeLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.location = {
        $regex: safeLocation,
        $options: "i",
      };
    }

    if(minPrice !== undefined){
      const price = Number(minPrice);

      if(!Number.isFinite(price) || price<0 ){
        return res.status(400).json({
          message: "minPrice must be a valid non-negative number",
        });
      }

      filter.priceperNight = {
        ...filter.priceperNight,
        $gte: price,
      };
    }

    if(maxPrice !== undefined){
      const price = Number(maxPrice);

      if(!Number.isFinite(price) || price<0 ){
        return res.status(400).json({
          message: "maxPrice must be a valid non-negative number",
        });
      }

      filter.priceperNight = {
        ...filter.priceperNight,
        $lte: price,
      };
    }

    if(guests !== undefined){
      const numGuests = Number(guests);

      if(!Number.isInteger(numGuests) || numGuests<1){
        return res.status(400).json({
          message: "guests must be a valid positive integer",
        });
      }

      filter.maxGuests = {
        $gte: numGuests,
      };
    }

    if(bedrooms !== undefined){
      const numBedrooms = Number(bedrooms);

      if(!Number.isInteger(numBedrooms) || numBedrooms<1){
        return res.status(400).json({
          message: "bedrooms must be a valid positive integer",
        });
      }

      filter.bedrooms = {
        $gte: numBedrooms,
      };
    }

    
    if(checkIn && checkOut){
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      if(Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate){
        return res.status(400).json({
          message: "Please provide valid check-in and check-out dates",
        });
      }

      const bookedListings = await Booking.find({
        status: {$ne: "cancelled"},
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate },
      }).distinct("listing");

      filter._id = { $nin: bookedListings };
    }

    
    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if(!Number.isInteger(pageNumber) || pageNumber<1
    || !Number.isInteger(pageSize) || pageSize<1
    || pageSize>100){
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    
    let sortOption;

    switch(sort){
      case "price_asc":
        sortOption = {priceperNight: 1};
        break;
      
      case "price_desc":
        sortOption = {priceperNight: -1};
        break;

      case "newest":
        sortOption = {createdAt: -1};
        break;

      default:
        return res.status(400).json({
          message: "Invalid sort option. Use price_asc, price_desc, or newest",
        });
    }

    
    const totalListings = await Listing.countDocuments(filter);
    
  
    const skip = (pageNumber - 1) * pageSize;

    
    const listings = await Listing.find(filter)
      .populate("host", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      message: "Listings retrieved successfully",
      totalListings,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalListings / pageSize),
      pageSize, listings,
    });

  }catch (error) {
    res.status(500).json({
      message: "Failed to retrieve listings",
      error: error.message,
    });
  }
};


const getListingbyId = async (req,res) => {
  try {
    const {id} = req.params;
    const listing = await Listing.findById(id)
    .populate("host", "name email");

    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json({
      message: "Listing retrieved successfully",
      listing,
    });

  } catch (error) {
    if(error.name === "CastError"){
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    res.status(500).json({
      message:"Failed to retrieve listing",
      error: error.message,
    });
  }
};

const updateListing = async (req,res) => {
  try{
    const {id} = req.params;

    
    const listing = await Listing.findById(id);

    if(!listing){
      return res.status(404).json({
        message: "List not found",
      });
    }

    if(listing.host.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to update this listing",        
      });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "priceperNight",
      "bedrooms",
      "maxGuests",
      "images",
    ];


    allowedFields.forEach((field) => {
      if(req.body[field] !== undefined){
        listing[field] = req.body[field];
      }
    });

    
    await listing.save();
    res.status(200).json({
      message: "List updated successfully",
    });
  } catch (error) {
    if(error.name === "CastError"){
      return res.status(400).json({
        message: "Invalid listing ID or field value",
      });
    }

    if(error.name === "ValidationError"){
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update list",
      error: error.message,
    });
  }
};


const deleteListing = async (req,res) => {
  try{
    const{id} = req.params;

    
    const listing = await Listing.findById(id);

    
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    
    if(listing.host.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to delete this listing",
      });
    }

    
    await listing.deleteOne();

    res.status(200).json({
      message: "Listing deleted successfully",
    });
  }catch (error) {
    if (error.name === "CastError"){
      return res.status(400).json({
        message:"Invalid listing ID",
      });
    }

    res.status(500).json({
      message:"Failed to delete listing",
      error: error.message,
    });
  }
};


const getHostList = async (req,res) => {
  try{
    
    const listings = await Listing.find({
      host: req.user.userId,
    }).sort({createdAt: -1});

    return res.status(200).json({
      message: "Host listings retrieved successfully",
      count: listings.length,
      listings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve host listings",
      error: error.message,
    });
  }
};

module.exports = {createListing, getAllListings,
  getListingbyId, updateListing, deleteListing,
  getHostList};
