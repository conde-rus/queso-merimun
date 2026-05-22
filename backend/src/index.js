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

// ──────────────────────────────────────────
// Middlewares de seguridad y utilidad
// ──────────────────────────────────────────
app.use(helmet()); // Headers de seguridad HTTP
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' })); // Limita payload a 10KB
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter); // Rate limit global

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

// 404 para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: `Ruta ${req.originalUrl} no encontrada.` });
});

// Manejador de errores global (debe ir al final)
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
