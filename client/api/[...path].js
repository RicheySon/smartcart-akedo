// Vercel serverless function that handles all API routes
// This wraps the Express backend for serverless deployment
// Located in client/ directory to work with rootDirectory=client setting

// Set Vercel environment flag before requiring app
process.env.VERCEL = '1';
process.env.VERCEL_ENV = process.env.VERCEL_ENV || 'production';

let app;
try {
    // Path is relative to client/ directory, src/ is now inside client/
    app = require('../src/index');
} catch (error) {
    console.error('Failed to load Express app:', error);
    console.error('Error stack:', error.stack);
    // Return error handler function
    module.exports = async (req, res) => {
        res.status(500).json({
            success: false,
            error: {
                message: 'Server initialization failed',
                details: error.message,
                stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
            }
        });
    };
    return;
}

// Export as Vercel serverless function
// Vercel will call this function for /api/* routes
module.exports = async (req, res) => {
    try {
        // Vercel serverless functions receive the request with the full path
        // The Express app is configured to handle /api/* routes, so the URL should work as-is
        // However, we need to ensure the path includes /api prefix
        const originalUrl = req.url;
        
        // If the URL doesn't start with /api, prepend it
        // (Vercel may strip the /api prefix when routing to the function)
        if (!originalUrl.startsWith('/api')) {
            req.url = '/api' + (originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl);
        }
        
        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: {
                    message: 'Request handling failed',
                    details: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
                }
            });
        }
    }
};

