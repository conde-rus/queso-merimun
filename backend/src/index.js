import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { apiLimiter, errorHandler } from './middleware/seguridad.js';
import { verificarConexionEmail } from './services/emailService.js';
import productosRouter from './routes/productos.js';
import pedidosRouter from './routes/pedidos.js';

// ──────────────────────────────────────────
// Inicialización
// ──────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── TRUST PROXY: necesario en Railway/Heroku/cualquier servidor con proxy ──
app.set('trust proxy', 1);

// ──────────────────────────────────────────
// Middlewares de seguridad y utilidad
// ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'https://quesomerimun.com',
      'https://queso-miramu.web.app',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// ──────────────────────────────────────────
// Rutas
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    servicio: '🧀 Quesería API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV,
  });
});

app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.originalUrl} no encontrada.` });
});

// Manejador de errores global
app.use(errorHandler);

// ──────────────────────────────────────────
// Arranque del servidor
// ──────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('\n🧀 ══════════════════════════════════════');
  console.log(`   Quesería API corriendo en puerto ${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log('══════════════════════════════════════\n');

  await verificarConexionEmail();
});

export default app;