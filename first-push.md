# First Push to GitHub

Run these commands in your terminal from the project root directory:

```bash
# Initialize Git repository (if not already done)
git init

# Add all files to staging
git add .

# Commit the changes
git commit -m "Initial commit with blog project"

# Add your GitHub repository as remote
git remote add origin https://github.com/siddhiupadhyay23/Blog.git

# Push to GitHub
git push -u origin main
```

If your default branch is named "master" instead of "main", use:

```bash
git push -u origin master
```

If you get an error about the remote branch already existing, you might need to pull first:

```bash
git pull origin main --allow-unrelated-histories
```

Then try pushing again:

```bash
git push -u origin main
```