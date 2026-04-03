import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // Get token from cookies or Authorization header
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(errorHandler(401, 'Access token is required'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err);
      return next(errorHandler(401, 'Token is not valid'));
    }
    
    req.user = user;
    next();
  });
};