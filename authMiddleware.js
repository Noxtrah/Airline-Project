const jwt = require('jsonwebtoken');

// Secret key for signing and verifying tokens
const secretKey = 'your_secret_key'; // Replace with a strong secret key

// Middleware to check JWT and authenticate requests
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Missing token' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateJWT, secretKey };