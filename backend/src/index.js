require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const { testConnection }    = require('./config/db');
const studentRoutes         = require('./routes/student.routes');
const marksRoutes           = require('./routes/marks.routes');
const marksCtrl             = require('./controllers/marks.controller');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & utility middleware ────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API routes ───────────────────────────────────────────────────
app.use('/api/students',                     studentRoutes);
app.use('/api/students/:studentId/marks',    marksRoutes);
app.get('/api/subjects',                     marksCtrl.getAllSubjects);

// ── 404 & global error handler ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────
async function start() {
  await testConnection();           // fail fast if DB is unreachable
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`📋  API base: http://localhost:${PORT}/api`);
  });
}

start();
