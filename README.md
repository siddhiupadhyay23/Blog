# Soul System Blog

A modern blog application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (sign up, sign in, sign out)
- Admin dashboard for content management
- Blog post creation and management
- Comments system
- Contact form for visitor messages
- Newsletter subscription
- Responsive design for all devices
- Dark/light mode toggle

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS, Flowbite React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/soul-system-blog.git
   cd soul-system-blog
   ```

2. Install server dependencies
   ```
   npm install
   ```

3. Install client dependencies
   ```
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the development server
   ```
   # In the root directory
   npm run dev
   ```

## Deployment

The application can be deployed to platforms like Vercel, Netlify, or Heroku.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite React](https://flowbite-react.com/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)