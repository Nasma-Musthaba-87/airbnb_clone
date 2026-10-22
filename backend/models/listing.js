const mongoose = require ("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title:{
      type: String,
      required: true,
      trim: true,
    },

    description:{
      type: String,
      required: true,
    },

    location:{
      type: String,
      required: true,
      trim: true,
    },

    priceperNight:{
      type: Number,
      required: true,
      min: 1,
    },

    bedrooms: {
      type: Number,
      required: true,
      min:0,
    },

    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    images: {
      type: [String],
      default: [],
    },

    host:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
},
{
  timestamps: true,
}
);

const Listing  = mongoose.model ("Listing", listingSchema);

module.exports = Listing;