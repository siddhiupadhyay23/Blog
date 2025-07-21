// Simple build script for Vercel
const { execSync } = require('child_process');

try {
  // Build the client
  console.log('Building client...');
  execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
  console.log('Client build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}