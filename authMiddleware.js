const jwt = require('jsonwebtoken');

const secretKey = 'generated_secret_key';

// Middleware to check JWT and authenticate requests
function authenticateJWT(req, res, next) {
  const authHeader = req.header('Authorization');

  console.log('Received Token:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized - Missing token' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token without the 'Bearer' prefix

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Token Verification Error:', err);
      return res.status(403).json({ message: 'Forbidden - Invalid token' });
    }
    req.user = decoded; // Store decoded user information in req.user
    next();
  });
}

module.exports = { authenticateJWT, secretKey };