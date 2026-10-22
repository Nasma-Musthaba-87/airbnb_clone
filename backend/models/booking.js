const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    guest:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      checkIn:{
        type: Date,
        required: true,
      },

      checkOut: {
        type: Date,
        required: true,
      },

      guests: {
        type: Number,
        required: true,
        min: 1
      },

      totalPrice:{
        type: Number,
        required: true,
        min: 0,
      },

      status: {
        type: String,
        enum: ["confirmed", "cancelled"],
        default: "confirmed",
      },
    },
    {
      timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;