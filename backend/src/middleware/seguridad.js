import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';

/**
 * Rate limiter general para la API.
 * Previene abuso y ataques de fuerza bruta.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor espera 15 minutos.',
  },
});

/**
 * Rate limiter estricto para el endpoint de pedidos.
 * Evita spam en el formulario de contacto.
 */
export const pedidosLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 pedidos por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Has enviado demasiados mensajes. Por favor espera una hora.',
  },
});

/**
 * Middleware que verifica errores de validación de express-validator.
 * Retorna un 422 con los errores si los hay.
 */
export const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Datos inválidos en la solicitud.',
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
};

/**
 * Middleware manejador de errores global.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error no controlado:', err);
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor.'
        : err.message,
  });
};
