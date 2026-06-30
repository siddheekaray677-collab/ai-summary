const jwt = require('jsonwebtoken');
const { User, Settings } = require('../models');

// Lazy load Clerk SDK to prevent startup crashes if package install is not fully written
let clerkClient = null;
try {
  const clerkSdk = require('@clerk/clerk-sdk-node');
  clerkClient = clerkSdk.clerkClient || clerkSdk;
} catch (e) {
  console.log('Clerk SDK not loaded yet. Fallback active.');
}

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  // Sanitize Javascript string conversions
  if (token === 'undefined' || token === 'null' || token === '') {
    token = undefined;
  }

  console.log('[AUTH DEBUG] Path:', req.path, 'Method:', req.method, 'Token Exists:', !!token, 'Token Preview:', token ? token.substring(0, 15) + '...' : 'none');

  if (token) {
    try {

      // 1. If Clerk is configured in environment
      if (process.env.CLERK_SECRET_KEY && clerkClient) {
        try {
          // Verify Clerk session JWT token dynamically depending on SDK version
          let decoded = null;
          const verifyMethod = clerkClient.verifyToken || clerkClient.verifySessionToken;
          
          if (verifyMethod) {
            decoded = await verifyMethod.call(clerkClient, token);
          } else {
            // Fallback decode if SDK signature helper isn't reachable
            decoded = jwt.decode(token);
          }

          if (!decoded || !decoded.sub) {
            throw new Error('Invalid or unparseable Clerk session token.');
          }
          
          // First check: does user already exist in our SQLite DB? (Optimized to skip API calls)
          let user = await User.findByPk(decoded.sub);
          
          if (!user) {
            let email = '';
            let name = 'Clerk User';

            try {
              // Get user details from Clerk API
              const clerkUser = await clerkClient.users.getUser(decoded.sub);
              email = clerkUser.emailAddresses[0]?.emailAddress || '';
              name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clerk User';
            } catch (clerkApiError) {
              console.warn('Clerk API query failed. Extracting details from JWT claims:', clerkApiError.message);
              email = decoded.email || decoded.claims?.email || `clerk_${decoded.sub}@clerk.local`;
              name = decoded.name || decoded.claims?.name || 'Clerk User';
            }

            // Sync with local SQLite Database to preserve relational integrity
            const userCount = await User.count();
            const role = userCount === 0 ? 'admin' : 'user';

            user = await User.create({
              id: decoded.sub, // Primary key is the Clerk User ID
              name,
              email,
              password: 'CLERK_EXTERNAL_AUTHENTICATED',
              role
            });

            // Create default settings
            await Settings.create({
              userId: user.id,
              theme: 'dark'
            });
          }

          req.user = user;
          return next();
        } catch (clerkError) {
          console.error('Clerk session token validation failed:', clerkError.message);
          return res.status(401).json({ message: 'Clerk authentication failed' });
        }
      }

      // 2. Default Local JWT Validation
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meetmind_ai_super_secure_jwt_secret_2026');

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Authentication protect middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
