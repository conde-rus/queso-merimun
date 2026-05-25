import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { db } from '../config/firebase.js';
import { enviarNotificacionPedido } from '../services/emailService.js';
import { pedidosLimiter, validar } from '../middleware/seguridad.js';

const router = Router();

// ── Multer: recibe el comprobante en memoria (no en disco) ──
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.'));
    }
  },
});

// ── Validaciones de campos de texto ──
const reglasValidacion = [
  body('nombre').trim().isLength({ min: 2, max: 80 }).withMessage('Nombre requerido.').escape(),
  body('correo').trim().isEmail().withMessage('Correo inválido.').normalizeEmail(),
  body('telefono').trim().notEmpty().withMessage('Teléfono requerido.').escape(),
  body('direccion').trim().isLength({ min: 5, max: 200 }).withMessage('Dirección requerida.').escape(),
  body('ciudad').trim().isLength({ min: 2 }).withMessage('Ciudad requerida.').escape(),
  body('mensaje').trim().isLength({ min: 10, max: 2000 }).withMessage('Describe tu pedido.').escape(),
  body('formaPago')
  .isIn(['nequi', 'bancolombia', 'pendiente'])
  .withMessage('Forma de pago inválida.'),
];

/**
 * POST /api/pedidos
 * Recibe el formulario completo con comprobante adjunto.
 * Guarda en Firestore y envía correo con el comprobante adjunto.
 */
router.post(
  '/',
  pedidosLimiter,
  upload.single('comprobante'), // campo "comprobante" del FormData
  reglasValidacion,
  validar,
  async (req, res, next) => {
    try {
      const {
        nombre, correo, telefono, tipoPedido,
        direccion, barrio, ciudad, indicaciones,
        mensaje, formaPago,
      } = req.body;

      const comprobante = req.file; // buffer en memoria

      // Construir el documento a guardar en Firestore
      const nuevoPedido = {
        nombre,
        correo,
        telefono,
        tipoPedido: tipoPedido || 'pedido',
        direccionEntrega: {
          direccion,
          barrio: barrio || '',
          ciudad,
          indicaciones: indicaciones || '',
        },
        mensaje,
        formaPago,
        tieneComprobante: !!comprobante,
        comprobanteNombre: comprobante?.originalname || null,
        estado: 'pendiente', // pendiente | confirmado | enviado | entregado
        fechaCreacion: new Date().toISOString(),
        ip: req.ip,
        origen: req.headers.origin || 'web',
      };

      // Guardar en Firestore
      const docRef = await db.collection('pedidos').add(nuevoPedido);
      console.log(`📦 Pedido ${docRef.id} de ${nombre} (${formaPago})`);

      // Enviar correos con el comprobante adjunto (no bloquea la respuesta)
      enviarNotificacionPedido(nuevoPedido, comprobante).catch((err) =>
        console.error('⚠️ Error enviando correo:', err.message)
      );

      res.status(201).json({
        success: true,
        mensaje: '¡Pedido recibido! Te confirmaremos pronto.',
        id: docRef.id,
      });
    } catch (error) {
      // Error de Multer (tamaño o tipo de archivo)
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'El archivo supera los 5MB.' });
      }
      next(error);
    }
  }
);

/**
 * GET /api/pedidos  [Solo uso interno/admin]
 */
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await db
      .collection('pedidos')
      .orderBy('fechaCreacion', 'desc')
      .limit(50)
      .get();

    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      ip: undefined,
    }));

    res.json({ success: true, total: pedidos.length, data: pedidos });
  } catch (error) {
    next(error);
  }
});

export default router;