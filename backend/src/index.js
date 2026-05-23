import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { apiLimiter, errorHandler } from './middleware/seguridad.js';
import { verificarConexionEmail } from './services/emailService.js';
import productosRouter from './routes/productos.js';
import pedidosRouter from './routes/pedidos.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ── TRUST PROXY: obligatorio en Railway ──────────────────
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'https://quesomerimun.com',
      'https://queso-miramu.web.app',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// ── RUTAS ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    servicio: '🧀 Quesería Merimun API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV,
  });
});

app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.originalUrl} no encontrada.` });
});

app.use(errorHandler);

// ── ARRANQUE ──────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('\n🧀 ══════════════════════════════════════');
  console.log(`   Quesería Merimun API · Puerto ${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log('══════════════════════════════════════\n');
  await verificarConexionEmail();
});

export default app;