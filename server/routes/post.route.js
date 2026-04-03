import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost } from '../controllers/post.controller.js';

const router = express.Router();

// Create post route - requires authentication and admin privileges
router.post('/create', verifyToken, create);

// Get posts route - public access, supports filtering and pagination
router.get('/getposts', getposts);

// Delete post route - requires authentication and proper authorization
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);

// Update post route - requires authentication and proper authorization
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

export default router;