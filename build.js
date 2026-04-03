// build.js - Script to build the client
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure client/dist directory exists
const distDir = path.join(process.cwd(), 'client', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the client
console.log('Building client...');
exec('cd client && npm install && npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  console.log(`stdout: ${stdout}`);
  console.log('Client build complete!');
});