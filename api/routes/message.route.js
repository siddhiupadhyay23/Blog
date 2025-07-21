import express from 'express';
import { createMessage, getMessages, markAsRead, deleteMessage } from '../controllers/message.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Public route - anyone can send a message
router.post('/create', createMessage);

// Protected routes - only admin can access
router.get('/', verifyToken, getMessages);
router.put('/:messageId/read', verifyToken, markAsRead);
router.delete('/:messageId', verifyToken, deleteMessage);

export default router;