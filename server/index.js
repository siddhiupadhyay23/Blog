// index.js - Unified entry point for development and deployment
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);

// Helper for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// For local development and traditional servers
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;