// Re-export the serverless wrapper under `client/api` to avoid duplicate/conflicting
// function definitions when deploying a monorepo-style project to Vercel.
try {
  module.exports = require('../client/api/[...path].js');
} catch (err) {
  console.error('Failed to re-export client API wrapper:', err);
  module.exports = async (req, res) => {
    res.status(500).json({ success: false, error: { message: 'Serverless wrapper missing' } });
  };
}

