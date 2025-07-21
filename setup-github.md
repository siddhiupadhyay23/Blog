# Setting Up GitHub Repository

Follow these steps to push your blog project to GitHub:

## 1. Initialize Git Repository

Open a terminal in your project root directory and run:

```bash
git init
```

## 2. Add Files to Git

```bash
git add .
```

## 3. Commit Changes

```bash
git commit -m "Initial commit"
```

## 4. Create a GitHub Repository

1. Go to [GitHub](https://github.com/)
2. Log in to your account
3. Click the "+" icon in the top right corner
4. Select "New repository"
5. Enter a name for your repository (e.g., "soul-system-blog")
6. Leave it as a public repository
7. Do NOT initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## 5. Link Local Repository to GitHub

GitHub will show you commands to push an existing repository. Run these commands:

```bash
git remote add origin https://github.com/yourusername/soul-system-blog.git
git branch -M main
git push -u origin main
```

Replace `yourusername` with your actual GitHub username and `soul-system-blog` with your repository name.

## 6. Verify

Go to your GitHub repository URL to verify that all files have been pushed correctly.

## 7. Future Updates

For future changes, use these commands:

```bash
git add .
git commit -m "Your commit message"
git push
```