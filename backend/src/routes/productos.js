import { Router } from 'express';
import { db } from '../config/firebase.js';

const router = Router();

/**
 * GET /api/productos
 * Retorna todos los productos del menú desde Firestore.
 * Opcionalmente filtra por categoría: ?categoria=frescos
 *
 * Estructura de cada documento en Firestore (colección "productos"):
 * {
 *   nombre: string,
 *   descripcion: string,
 *   precio: number,
 *   unidad: string (ej: "por kg", "por unidad"),
 *   categoria: string (ej: "frescos", "madurados", "combos"),
 *   imagen: string (URL de Firebase Storage),
 *   disponible: boolean,
 *   destacado: boolean,
 *   orden: number (para ordenar dentro de la categoría),
 *   etiquetas: string[] (ej: ["sin lactosa", "artesanal"]),
 * }
 */
router.get('/', async (req, res, next) => {
  try {
    const { categoria } = req.query;

    let query = db.collection('productos').where('disponible', '==', true);

    if (categoria) {
      const categoriasValidas = ['frescos', 'madurados', 'combos', 'especiales'];
      if (!categoriasValidas.includes(categoria)) {
        return res.status(400).json({
          success: false,
          error: `Categoría inválida. Usa: ${categoriasValidas.join(', ')}`,
        });
      }
      query = query.where('categoria', '==', categoria);
    }

    query = query.orderBy('orden', 'asc');

    const snapshot = await query.get();

    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Asegurar tipos correctos para el frontend
      precio: Number(doc.data().precio) || 0,
      destacado: Boolean(doc.data().destacado),
    }));

    res.json({
      success: true,
      total: productos.length,
      data: productos,
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    next(error);
  }
});

/**
 * GET /api/productos/:id
 * Retorna un producto específico por ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await db.collection('productos').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
});

export default router;
