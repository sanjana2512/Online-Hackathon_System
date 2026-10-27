const jwt = require('jsonwebtoken');

// This function acts as a "gatekeeper" for protected routes
module.exports = function (req, res, next) {
  // 1. Get token from header
  const token = req.header('x-auth-token'); // This is the header we'll use

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // jwt.verify() checks the signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If valid, add the user's ID to the request object
    req.user = decoded.user;
    
    // Move on to the next function (the route's controller)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
