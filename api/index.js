// index.js or server.js (your main server file)
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';  // Fixed: Changed from auth.js to auth.route.js
import postRoutes from './routes/post.route.js';  // Fixed: Changed from post.js to post.route.js
import commentRoutes from './routes/comment.route.js';  // Fixed: Changed from comment.js to comment.route.js
import aiRoutes from './routes/ai.js'; // This one is correct
import uploadRoutes from './routes/upload.js'; // Import upload routes
import messageRoutes from './routes/message.route.js'; // Import message routes
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/ai', aiRoutes); // Add AI routes
app.use('/api/upload', uploadRoutes); // Add upload routes
app.use('/api/message', messageRoutes); // Add message routes

// Serve static files
app.use(express.static(path.join(__dirname, '/client/dist')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve HTML helper files
app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});