const Listing = require ("../models/listing.js");

//Create new listing
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

    //Check required fields
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

    //Create listing in MongoDB
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

//Get All listings
const getAllListings = async (req,res) => {
  try{
    const {
      location,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    //Build the MongoDB filter
    const filter = {};

    //Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    //Filter by minimum price
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

    //Filter by maximum price
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

    //Filter by number of guests
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

    //Filter by number of bedrooms
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

    //Validate pagination values
    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if(!Number.isInteger(pageNumber) || pageNumber<1
    || !Number.isInteger(pageSize) || pageSize<1
    || pageSize>100){
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    //Determine sorting order
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

    //Count listings matching the search filters
    const totalListings = await Listing.countDocuments(filter);
    
    //Calculate how many listings to skip
    const skip = (pageNumber - 1) * pageSize;

    //Retrieve listings from MongoDB with filters, sorting, and pagination
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


//Get a single Listing By ID
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

//Update a listing
const updateListing = async (req,res) => {
  try{
    const {id} = req.params;

    //Find the listing
    const listing = await Listing.findById(id);

    if(!listing){
      return res.status(404).json({
        message: "List not found",
      });
    }

    //Check whether the Login user owns the listing
    if(listing.host.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to update this listing",        
      });
    }

    //Fields that can be updated
    const allowedFields = [
      "title",
      "description",
      "location",
      "priceperNight",
      "bedrooms",
      "maxGuests",
      "images",
    ];

    //Updated only the permitted fields
    allowedFields.forEach((field) => {
      if(req.body[field] !== undefined){
        listing[field] = req.body[field];
      }
    });

    //Validate and save updated listing
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

//Delete the list
const deleteListing = async (req,res) => {
  try{
    const{id} = req.params;

    //Find the listing
    const listing = await Listing.findById(id);

    //Check whether the listing exists
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    //Check whether the login user owns the listing
    if(listing.host.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to delete this listing",
      });
    }

    //Delete the listing
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

//Host Dashboard: Get all listings for the logged-in host
const getHostList = async (req,res) => {
  try{
    //Find listings owned by the logged-in host
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
