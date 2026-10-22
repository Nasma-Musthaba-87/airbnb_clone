const Booking = require("../models/booking");
const Listing = require("../models/listing");

const createBooking = async (req, res) => {
  try{
    const{listingId, checkIn, checkOut, guests} = req.body;

    //Validate required fields
    if(!listingId || !checkIn || !checkOut|| guests == null) {
      return res.status(400).json({
        message: "Please provide listingId, checkIn, checkOut and guests",
      });
    }

    //Validate guest count
    const guestCount = Number(guests);

    if(!Number.isInteger(guestCount) || guestCount < 1){
      return res.status(400).json({
        message: "Guests must be positive whole number",
      });
    }

    //Validate dates
    const checkIndate = new Date(checkIn);
    const checkOutdate = new Date(checkOut);

    if(
      Number.isNaN(checkIndate.getTime()) ||
      Number.isNaN(checkOutdate.getTime())
    ){
      return res.status(400).json({
        message: "Please provide valid check-in and check-out dates",
      });
    }

    //Check that check-out is after check-in
    if(checkOutdate <= checkIndate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
      });
    }

    //Check that check-in is not in the past
    const today = new Date();
    today.setHours(0,0,0,0); //Set to midnight for comparison

    if(checkIndate < today) {
      return res.status(400).json({
        message: "Check-in date cannot be in the past",
      });
    }
    
    //Find the property
    const listing = await Listing.findById(listingId);
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    //Check maximum guest capacity
    if (guestCount > listing.maxGuests) {
      return res.status(400).json({
        message: `This listing allows a maximum of ${listing.maxGuests} guests`,
      });
    }

    //Calculate the number of nights
    const millisecondsperDay = 1000*60*60*24;
    const nights = Math.ceil(
      (checkOutdate-checkIndate)/millisecondsperDay
    );

    //Check whether the property is already booked
    const overlapBooking = await Booking.findOne({
      listing: listingId,
      status: {$ne: "cancelled"},
      checkIn: { $lt: checkOutdate },
      checkOut: { $gt: checkIndate },
    });

    if(overlapBooking) {
      return res.status(400).json({
        message: "This property is already booked for the selected dates",
      });
    }

    //Calculate the price on the server
    const totalPrice = nights * listing.priceperNight;

    //Save the booking
    const booking = await Booking.create({
      listing: listing._id,
      guest: req.user.userId,
      checkIn: checkIndate,
      checkOut: checkOutdate,
      guests: guestCount,
      totalPrice,
    });

    //Return the result
    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  }catch (error) {
    if (error.name === "CastError"){
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const getBookings = async (req, res) => {
  try {
    //Find bookings for the logged-in user
    const bookings = await Booking.find({
      guest: req.user.userId,
    })
      .populate("listing")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings retrieved successfully",
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve bookings",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const {id} = req.params;

    //Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    //Check if the logged-in user is the guest who made the booking
    if (booking.guest.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    //Check whether the booking is already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }
    
    //Update the booking status
    booking.status = "cancelled";
    await booking.save();

    //Return the response
    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });

  } catch (error) {
    if(error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

//To check the availability
const checkAvailability = async (req, res) => {
  try {
    const {listingId, checkIn, checkOut} = req.query;

    //Validate required fields
    if(!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please provide listingId, checkIn and checkOut",
      });
    }

    //Validate dates
    const checkIndate = new Date(checkIn);
    const checkOutdate = new Date(checkOut);

    if(
      Number.isNaN(checkIndate.getTime()) ||
      Number.isNaN(checkOutdate.getTime()) ||
      checkOutdate <= checkIndate
    ){
      return res.status(400).json({
        message: "Please provide valid check-in and check-out dates",
      });
    }

    //Find the property
    const listing = await Listing.findById(listingId);
    if(!listing){
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    //Check for overlapping active bookings
    const overlapBooking = await Booking.findOne({
      listing: listingId,
      status: {$ne: "cancelled"},
      checkIn: { $lt: checkOutdate },
      checkOut: { $gt: checkIndate },
    });

    //Return the availability result
    if(overlapBooking) {
      return res.status(200).json({
        available: false,
        message: "This property is already booked for the selected dates",
      });
    }
    
    return res.status(200).json({
      available: true,
      message: "This property is available for the selected dates",
    });

  } catch (error) {
    if(error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    return res.status(500).json({
      message: "Failed to check availability",
      error: error.message,
    });
  }
};

//Create booking by ID
const getBookingbyId = async (req, res) => {
  try {
    //Get booking Id from the url
    //const {id} = req.params;

    //Find the booking by ID and retrieve the property details
    const booking = await Booking.findById(req.params.id)
    .populate("listing")
    .populate("guest", "name email");

    //Check whether the booking exists
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const isGuest = booking.guest._id.toString() === req.user.userId;

    const isHost =
        booking.listing &&
        booking.listing.host &&
        booking.listing.host.toString() === req.user.userId;

    //Check if the logged-in user is the guest who made the booking
    if (!isGuest && !isHost) {
      return res.status(403).json({
        message: "You are not authorized to view this booking",
      });
    }

    //Return the booking details
    return res.status(200).json({booking});

  } catch (error) {
    if(error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve booking",
      error: error.message,
    });
  }
};

//HOST BOOKING MANAGEMENT API

const getHostBookings = async (req, res) => {
  try {
    //Find listings owned by the logged-in host
    const listings = await Listing.find({ 
      host: req.user.userId 
    }).select("_id");

    //Extract listing IDs
    const listingIds = listings.map(listing => listing._id);

    //Find bookings for the host's listings
    const bookings = await Booking.find({
      listing: { $in: listingIds },
    })
      .populate("listing", "title location priceperNight")
      .populate("guest", "name email")
      .sort({ createdAt: -1 });

      //Return the host bookings
    return res.status(200).json({
      message: "Host bookings retrieved successfully",
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve host bookings",
      error: error.message,
    });
  }
};

module.exports = {createBooking, getBookings, cancelBooking, checkAvailability, getBookingbyId, getHostBookings};