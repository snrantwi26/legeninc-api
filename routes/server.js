require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Trust reverse proxies (important for accurate IP rate limiting on Railway/Nginx)
app.set('trust proxy', 1);

// Database Initialization
connectDB();

// Global Security Headers
app.use(helmet());

// CORS Setup (Exclusively allows production domain variants)
const whitelist = ['https://legenincgh.online', 'https://www.legenincgh.online'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Cross-Origin Access Denied by LegenInc Security Policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Parsing Payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Basic Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each IP address to 100 requests per window
  message: {
    success: false,
    message: 'Too many request attempts logged from this IP. Please try again later.'
  }
});
app.use(globalLimiter);

// Specific Rate Limiter for Client Requests to Prevent Spam
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour window
  max: 10, // Limit each IP to 10 request submissions per hour
  message: {
    success: false,
    message: 'Service request quota reached for this hour. Please try again later.'
  }
});
app.use('/api/requests', requestLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/artisans', require('./routes/artisanRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource path not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Critical service failure.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Production API Operational on port ${PORT}`));