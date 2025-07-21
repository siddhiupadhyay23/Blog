# Message System for Soul System Blog

This document explains how to use the message system in your blog.

## How It Works

1. **Contact Form**: Visitors can send you messages through the Contact page.
2. **Admin Dashboard**: You can view and manage all messages in the admin dashboard.

## Features

### For Visitors:
- Fill out the contact form with name, email, subject, and message
- Receive confirmation when message is sent successfully

### For Admins:
- View all messages in the dashboard under the "Messages" tab
- See unread messages highlighted
- Read message content in a modal
- Mark messages as read automatically when viewing them
- Delete messages you no longer need

## Implementation Details

### Backend:
- Messages are stored in MongoDB using the Message model
- API endpoints for creating, reading, updating, and deleting messages
- Only admins can view and manage messages

### Frontend:
- Contact form for visitors to send messages
- Dashboard interface for admins to manage messages
- Unread messages are highlighted for better visibility

## How to Access Messages

1. Log in as an admin
2. Go to the Dashboard
3. Click on the "Messages" tab in the sidebar
4. View and manage your messages

## Future Improvements

- Email notifications when new messages arrive
- Message filtering and search functionality
- Message categories or tags
- Reply functionality directly from the dashboard