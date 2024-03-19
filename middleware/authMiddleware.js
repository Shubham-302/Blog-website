//  middleware/authMiddleware
module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.session.user) {
        // User is authenticated
        return next();
      } else {
        // User is not authenticated, redirect to login
        res.redirect('/auth/login');
      }
    },
  
    ensureAdmin: (req, res, next) => {
      if (req.session.user && req.session.user.isAdmin) {
        // User is an admin
        return next();
      } else {
        // User is not an admin, redirect to home
        res.redirect('/');
      }
    },
  };
  