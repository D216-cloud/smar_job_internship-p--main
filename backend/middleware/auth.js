const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'yoursecretkey';

module.exports = function (req, res, next) {
  console.log('🔍 Auth middleware - Checking request:', req.method, req.path);
  
  // Skip auth for specific routes
  const publicPaths = ['/api/auth/login', '/api/auth/register'];
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  if (!token) {
    console.log('❌ No token in authorization header');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, SECRET);
    console.log('✅ Token verified, user data:', decoded);
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('❌ Token expired');
      return res.status(401).json({ error: 'Token expired' });
    }
    
    req.user = decoded;
    console.log('✅ Auth middleware passed, user:', req.user);
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
};