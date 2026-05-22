/**
 * Script de seed para poblar Firebase con productos de ejemplo.
 * Ejecutar UNA SOLA VEZ para inicializar la base de datos.
 *
 * Uso: node scripts/seed.js
 */

import 'dotenv/config';
import admin from 'firebase-admin';

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const productosEjemplo = [
  // ─── FRESCOS ───────────────────────────────────
  {
    nombre: 'Queso Campesino Fresco',
    descripcion: 'Queso blanco suave y húmedo, ideal para acompañar arepas y café. Elaborado con leche entera de vaca, salado al gusto.',
    precio: 18000,
    unidad: 'por kg',
    categoria: 'frescos',
    imagen: null, // Reemplaza con URL de Firebase Storage
    disponible: true,
    destacado: true,
    orden: 1,
    etiquetas: ['artesanal', 'sin preservantes'],
  },
  {
    nombre: 'Mozzarella Artesanal',
    descripcion: 'Mozzarella fresca elaborada con técnica italiana. Perfecta para pizzas, ensaladas caprese y pastas gratinadas.',
    precio: 28000,
    unidad: 'por 500g',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 2,
    etiquetas: ['italiano', 'elástico'],
  },
  {
    nombre: 'Queso Doble Crema',
    descripcion: 'Suave, cremoso y con alto contenido de grasa. El favorito de Colombia para quesillo y aborrajados.',
    precio: 22000,
    unidad: 'por kg',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 3,
    etiquetas: ['tradicional', 'colombiano'],
  },
  {
    nombre: 'Ricotta Casera',
    descripcion: 'Queso fresco y granulado, ideal para postres, rellenos de pasta y ensaladas. Bajo en sodio.',
    precio: 20000,
    unidad: 'por 500g',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 4,
    etiquetas: ['bajo sodio', 'versátil'],
  },

  // ─── MADURADOS ─────────────────────────────────
  {
    nombre: 'Queso Parmesano Colombiano',
    descripcion: 'Madurado 12 meses en cámaras de temperatura controlada. Textura granular, sabor intenso y perfecto para rallar.',
    precio: 65000,
    unidad: 'por kg',
    categoria: 'madurados',
    imagen: null,
    disponible: true,
    destacado: true,
    orden: 1,
    etiquetas: ['añejado 12 meses', 'gourmet'],
  },
  {
    nombre: 'Queso Manchego Artesanal',
    descripcion: 'Inspirado en la tradición española, elaborado con leche de oveja. Corteza natural, sabor ligeramente picante.',
    precio: 55000,
    unidad: 'por kg',
    categoria: 'madurados',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 2,
    etiquetas: ['oveja', 'español'],
  },
  {
    nombre: 'Queso Gouda Ahumado',
    descripcion: 'Gouda artesanal con proceso de ahumado natural en madera de roble. Corteza oscura, interior cremoso y suave.',
    precio: 48000,
    unidad: 'por kg',
    categoria: 'madurados',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 3,
    etiquetas: ['ahumado', 'roble'],
  },

  // ─── COMBOS / TABLAS ───────────────────────────
  {
    nombre: 'Tabla Gourmet para 2',
    descripcion: 'Selección curada de 3 quesos (frescos + madurado), mermelada de mora, nueces, uvas frescas y galletas artesanales.',
    precio: 85000,
    unidad: 'por tabla',
    categoria: 'combos',
    imagen: null,
    disponible: true,
    destacado: true,
    orden: 1,
    etiquetas: ['para 2 personas', 'maridaje', 'regalo'],
  },
  {
    nombre: 'Tabla Grande para Eventos',
    descripcion: '6 variedades de quesos, charcutería, frutas de temporada, frutos secos, mermeladas y pan artesanal. Para 6-8 personas.',
    precio: 220000,
    unidad: 'por tabla',
    categoria: 'combos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 2,
    etiquetas: ['6-8 personas', 'evento', 'personalizable'],
  },
  {
    nombre: 'Combo Surtido Mensual',
    descripcion: 'Suscripción mensual con 3 quesos frescos + 1 madurado seleccionado del mes. Entrega a domicilio incluida en Medellín.',
    precio: 95000,
    unidad: 'por mes',
    categoria: 'combos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 3,
    etiquetas: ['suscripción', 'domicilio', 'mensual'],
  },

  // ─── ESPECIALES ────────────────────────────────
  {
    nombre: 'Queso de Cabra con Hierbas',
    descripcion: 'Rulo de queso de cabra artesanal con hierbas provenzales: romero, tomillo y orégano. Sabor fresco y aromático.',
    precio: 42000,
    unidad: 'por rulo 300g',
    categoria: 'especiales',
    imagen: null,
    disponible: true,
    destacado: true,
    orden: 1,
    etiquetas: ['cabra', 'hierbas', 'gourmet'],
  },
];

const seed = async () => {
  console.log('🧀 Iniciando seed de productos...\n');

  const batch = db.batch();
  const colRef = db.collection('productos');

  for (const producto of productosEjemplo) {
    const ref = colRef.doc(); // ID autogenerado
    batch.set(ref, {
      ...producto,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ ${producto.nombre} (${producto.categoria})`);
  }

  await batch.commit();

  console.log(`\n✨ Seed completado: ${productosEjemplo.length} productos agregados.`);
  console.log('   Ahora puedes subir las fotos a Firebase Storage y actualizar los campos "imagen".');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
