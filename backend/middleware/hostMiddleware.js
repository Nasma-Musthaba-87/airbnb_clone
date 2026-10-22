//Your current protect middleware verifies the JWT, but it doesn't automatically restrict a route to hosts.

//We need a separate middleware that checks the user's role.

const requireHost = (req, res, next) => {
  if (!req.user || req.user.role !== "host") {
    
    return res.status(403).json({
      message: "Access denied. Only hosts can access this resource.",
    });
  }
  // User is a host, proceed to the next middleware or route handler
  next();
};

module.exports = requireHost;