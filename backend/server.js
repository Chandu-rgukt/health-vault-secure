import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables FIRST before any other imports
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables!');
  console.error('Please create a .env file in the backend directory with JWT_SECRET');
  process.exit(1);
}

// Initialize database FIRST (after env is loaded)
import initializeTables from './database/init.js';
import { ready as dbReady } from './database/db.js';

// Wait for database to be ready before importing routes
await dbReady();
await initializeTables();

// Import routes (after database is ready)
import authRoutes from './routes/auth.js';
import profilesRoutes from './routes/profiles.js';
import vitalsRoutes from './routes/vitals.js';
import reportsRoutes from './routes/reports.js';
import sharingRoutes from './routes/sharing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sharing', sharingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health Vault API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

