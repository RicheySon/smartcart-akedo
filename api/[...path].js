// Vercel serverless function that handles all API routes
// This wraps the Express backend for serverless deployment

const app = require('../src/index');

// Export as Vercel serverless function
// Vercel will call this function for /api/* routes
module.exports = async (req, res) => {
    // Vercel serverless functions receive the request with the full path
    // The Express app is configured to handle /api/* routes, so the URL should work as-is
    // However, we need to ensure the path includes /api prefix
    const originalUrl = req.url;
    
    // If the URL doesn't start with /api, prepend it
    // (Vercel may strip the /api prefix when routing to the function)
    if (!originalUrl.startsWith('/api')) {
        req.url = '/api' + (originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl);
    }
    
    return app(req, res);
};

