# Pushing Updates to GitHub Repository

Follow these steps to push your updated blog files to your existing GitHub repository:

## 1. Stage the new/modified files

```bash
git add .
```

## 2. Commit the changes

```bash
git commit -m "Added message system, categories page, and contact form"
```

## 3. Push to GitHub

```bash
git push
```

If you get an error about the remote branch, you might need to set the upstream branch:

```bash
git push -u origin main
```

Or if your default branch is called "master":

```bash
git push -u origin master
```

## 4. Verify

Check your GitHub repository to make sure all the new files have been pushed correctly.