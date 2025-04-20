const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the port to use
const PORT = 5001;

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.csv': 'text/csv'
};

// Create a server
const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);
  
  // Handle URLs with or without trailing slashes
  let filePath = './clean' + (req.url === '/' ? '/index.html' : req.url);
  
  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Set the content type based on file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Page not found
        fs.readFile('./clean/404.html', (err, content) => {
          if (err) {
            // If no 404 page exists, send basic 404 message
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>The page you requested could not be found.</p>');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Clean version server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});