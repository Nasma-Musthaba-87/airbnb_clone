const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try{
    //Get the authorization header
    const authHeader = req.headers.authorization;

    //Check whether a token was provided
    if(!authHeader){
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    //Extract the token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer")
    ? authHeader.split(" ")[1]
    : null;

    if (!token){
      return res.status(401).json({
        message: "Not authorized. Invalid token format.",
      });
    }

    //Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Store the decoded information on the request
    req.user = decoded;

    //Continue to the route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized. Inavalid or expired token.",
    });
  }
};

module.exports = protect;