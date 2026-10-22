const Review = require("../models/review");
const Listing = require("../models/listing");

//Create a new review

const createReview = async (req, res) => {
  try{
    const {listingId, rating, comment} = req.body;
    console.log("Received listingId:", listingId);

    //Validate required fields
    if(!listingId || rating == null || !comment?.trim()){
      return res.status(400).json({
        message: "ListingId, rating and comment are required",
      });
    }

    //Validate rating
    const reviewRating = Number(rating);

    if(!Number.isInteger(reviewRating) ||
    reviewRating < 1 ||
    reviewRating > 5){
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
      });
    }
    
    //Check whether the listing exists
    const listing = await Listing.findById(listingId);
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

console.log("Found listing:", listing);
console.log("Listing host:", listing.host);
console.log("Authenticated user:", req.user);

    //Prevent hosts from reviewing their own property
    if(listing.host.toString() === req.user.userId){
      return res.status(403).json({
        message: "You cannot review your own listing",
      });
    }

    //Check if the user has already reviewed this listing
    const existingReview = await Review.findOne({
      listing: listingId,
      guest: req.user.userId,
    });

    if(existingReview){
      return res.status(409).json({
        message: "You have already reviewed this listing",
      });
    }

    //Create the review
    const review = await Review.create({
      listing: listingId,
      guest: req.user.userId,
      rating: reviewRating,
      comment: comment.trim(),
    });

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });

  }catch (error) {
    if(error.name === "CastError"){
    return res.status(400).json({
      message: "Invalid listing ID",
    });
  }

  //Handle duplicate key errors from the unique index
  if(error.code === 11000){
    return res.status(409).json({
      message: "You have already reviewed this listing",
    });
  }

  return res.status(500).json({
    message: "Failed to create review",
    error: error.message,
  });
  }
};


//Get reviews for a specific listing
const getListingReviews = async (req, res) => {
  try{
    const {listingId} = req.params;

    //Check if the listing exists
    const listing = await Listing.findById(listingId);
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    //Get reviews for the listing
    const reviews = await Review.find({listing: listingId})
      .populate("guest", "name")
      .sort({createdAt: -1});

      const averageRating = reviews.length === 0 ? 0 : Number(
        (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1));

    return res.status(200).json({
      count: reviews.length,
      averageRating,
      reviews,
    });

  }catch (error) {
    if(error.name === "CastError"){
    return res.status(400).json({
      message: "Invalid listing ID",
    });
  }
    return res.status(500).json({
      message: "Failed to retrieve reviews",
      error: error.message,
    });
  }
};

//Delete your own review
const deleteReview = async (req, res) => {
  try{
    //Find the review
    const review = await Review.findById(req.params.id);

    if(!review){
      return res.status(404).json({
        message: "Review not found",
      });
    }

    //Check if the logged-in user is the guest who wrote the review
    if(review.guest.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to delete this review",
      });
    }

    //Delete the review
    await review.deleteOne();

    return res.status(200).json({
      message: "Review deleted successfully",
    });

  }catch (error) {
    if(error.name === "CastError"){
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }
    return res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

//Update your own review
const updateReview = async (req, res) => {
  try{
    const {rating, comment} = req.body;

    //Find the review
    const review = await Review.findById(req.params.id);

    if(!review){
      return res.status(404).json({
        message: "Review not found",
      });
    }

    //Check if the logged-in user is the guest who wrote the review
    if(review.guest.toString() !== req.user.userId){
      return res.status(403).json({
        message: "You are not authorized to update this review",
      });
    }

    //Validate the rating
    if(rating != undefined){
      const reviewRating = Number(rating);
      if(!Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5){
        return res.status(400).json({
          message: "Rating must be a number between 1 and 5",
        });
      }
      review.rating = reviewRating;
    }

    //Validate the comment
    if(comment != undefined){
      if(typeof comment !== "string" ||!comment?.trim()){
        return res.status(400).json({
          message: "Comment cannot be empty",
        });
      }
        review.comment = comment.trim();
    }

    //Save the updated review
    await review.save();

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });

  }catch (error) {
    if(error.name === "CastError"){
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }
    return res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

module.exports = {createReview, getListingReviews, deleteReview, updateReview};