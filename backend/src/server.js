import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

// Import Routes
import authRoutes from './routes/authRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import userPolicyRoutes from './routes/userPolicyRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Connect to database
connectDB();

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window`
});
app.use('/api', limiter);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Custom routes first (register, login, profile)
app.use('/api/auth', authRoutes);

// Mount Better Auth catch-all for other endpoints (session, sign-out, etc.)
app.all("/api/auth/*any", toNodeHandler(auth));

// Use other Routes
app.use('/api/policies', policyRoutes);
app.use('/api/user-policies', userPolicyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payments', paymentRoutes);

// Make uploads directory static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
