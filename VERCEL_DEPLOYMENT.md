# Deploying Your Blog to Vercel

Follow these steps to deploy your MERN stack blog to Vercel:

## 1. Build Your Client

First, build your React client:

```bash
cd client
npm run build
```

This will create a `dist` folder with your production-ready frontend.

## 2. Install Vercel CLI

Install the Vercel CLI globally:

```bash
npm install -g vercel
```

## 3. Login to Vercel

```bash
vercel login
```

Follow the prompts to log in to your Vercel account.

## 4. Deploy Your Project

From your project root directory:

```bash
vercel
```

Answer the deployment questions:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project: No
- Project name: soul-system-blog (or your preferred name)
- Directory: ./ (current directory)
- Override settings: No

## 5. Environment Variables

After deployment, go to your Vercel dashboard:
1. Select your project
2. Go to "Settings" > "Environment Variables"
3. Add your environment variables:
   - `MONGO`: your MongoDB connection string
   - `JWT_SECRET`: your JWT secret key

## 6. Configure MongoDB Access

Make sure your MongoDB Atlas cluster allows connections from Vercel:
1. Go to MongoDB Atlas
2. Navigate to Network Access
3. Add IP Address: 0.0.0.0/0 (to allow access from anywhere)

## 7. Redeploy with Environment Variables

```bash
vercel --prod
```

## 8. Visit Your Deployed Site

Your site will be available at: https://your-project-name.vercel.app

## Troubleshooting

If you encounter issues:

1. Check Vercel logs in the dashboard
2. Ensure all environment variables are set correctly
3. Verify MongoDB connection string is correct
4. Check that your API routes are working properly