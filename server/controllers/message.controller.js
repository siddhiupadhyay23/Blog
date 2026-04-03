import Message from '../models/message.model.js';
import { errorHandler } from '../utils/error.js';

export const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newMessage = new Message({
      name,
      email,
      subject,
      message
    });
    
    await newMessage.save();
    
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to send message' });
  }
};

export const getMessages = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see messages'));
  }
  
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to update messages'));
  }
  
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return next(errorHandler(404, 'Message not found'));
    }
    
    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete messages'));
  }
  
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);
    
    if (!message) {
      return next(errorHandler(404, 'Message not found'));
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};