// CXPulse Vercel Build Script
// Replaces VITE_API_URL_PLACEHOLDER in index.html with the actual backend URL
// Set VITE_API_URL in Vercel Environment Variables to your backend URL

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
html = html.replace('VITE_API_URL_PLACEHOLDER', apiUrl);

fs.writeFileSync(indexPath, html, 'utf8');
console.log(`[CXPulse Build] API URL set to: ${apiUrl}/api`);
