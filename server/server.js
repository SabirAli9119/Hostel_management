require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { securityHeaders, corsOptions, originCheck } = require('./middleware/security');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const User = require('./models/User');
const Room = require('./models/Room');
const Request = require('./models/Request');

const app = express();

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1); // needed behind Render, Nginx, etc.

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(sanitize);
app.use('/api', apiLimiter);
app.use('/api', originCheck);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  if (process.env.JWT_SECRET.length < 24) console.warn('Warning: JWT_SECRET is short. Use a long random string.');

  await connectDB();
  // Build the unique indexes (username, roomNumber) before accepting traffic.
  await Promise.all([User.init(), Room.init(), Request.init()]);

  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => console.log(`API running on http://localhost:${port}`));

  const shutdown = () => {
    console.log('Shutting down...');
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error(`Failed to start: ${err.message}`);
  process.exit(1);
});
