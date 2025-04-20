const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CLEAN_DIR = path.join(__dirname, 'clean');

// Mime types for serving different file types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.csv': 'text/csv'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Get the file path
  let filePath = path.join(CLEAN_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // If the URL ends with a slash, serve index.html from that directory
  if (req.url.endsWith('/') && req.url !== '/') {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  
  // Set the content type based on file extension
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        console.log(`File not found: ${filePath}`);
        fs.readFile(path.join(CLEAN_DIR, 'index.html'), (err, content) => {
          if (err) {
            // Server error
            res.writeHead(500);
            res.end('Server Error: Could not serve default page');
          } else {
            // Return index.html for all routes (single-page app)
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from ${CLEAN_DIR}`);
});