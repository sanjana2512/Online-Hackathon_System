const User = require('../models/userModel');

// Middleware to check if the user is an admin
// Assumes authMiddleware has already run and attached req.user
const adminMiddleware = async (req, res, next) => {
  // Check if req.user exists (meaning authMiddleware succeeded)
  if (!req.user || !req.user.id) {
    // This should technically be caught by authMiddleware, but good to double-check
    return res.status(401).json({ msg: 'Not authorized, no user found' });
  }

  try {
    // Find the user by ID from the token payload and select only the isAdmin field
    const user = await User.findById(req.user.id).select('isAdmin');

    // Check if the user exists and if their isAdmin flag is true
    if (user && user.isAdmin) {
      next(); // User exists and is an admin, proceed to the next handler (the controller)
    } else {
      // If user not found or isAdmin is false, deny access
      res.status(403).json({ msg: 'Forbidden: Admin access required' }); // 403 Forbidden status
    }
  } catch (error) {
    // Handle potential errors during database lookup
    console.error('Admin middleware error:', error.message);
    res.status(500).send('Server Error in admin check');
  }
};

module.exports = adminMiddleware;

