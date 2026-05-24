

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));

let credential;
try {
  const jsonPath = resolve(__dirname, '../queso-miramu-firebase-adminsdk-fbsvc-d55bd44ce7.json');
  const serviceAccount = JSON.parse(readFileSync(jsonPath, 'utf8'));
  credential = admin.credential.cert(serviceAccount);
  console.log('✅ Credenciales cargadas desde JSON');
} catch {
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
  console.log('✅ Credenciales cargadas desde .env');
}

admin.initializeApp({ credential });
const db = admin.firestore();

// ─────────────────────────────────────────────────────────
// 5 PRODUCTOS REALES DE MERIMUN
// ─────────────────────────────────────────────────────────
const productos = [
  {
    nombre: 'Queso Mana Merimun',
    descripcion: 'Queso fresco semiduro semigraso en lonchas. Suave, cremoso y perfecto para sándwiches, arepas y snacks del día a día.',
    peso: '250g · 6 porciones',
    unidad: 'por 250g',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: true,
    orden: 1,
    etiquetas: ['250g', 'lonchas', 'más suave'],
  },
  {
    nombre: 'Queso Mozzarella Merimun',
    descripcion: 'Gran bloque de mozzarella artesanal. Textura elástica y sabor fresco. Ideal para pizzas, gratinados y pastas.',
    peso: '2.400g (2.4 kg)',
    unidad: 'bloque de 2.4 kg',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: true,
    orden: 2,
    etiquetas: ['2.4 kg', 'bloque', 'mozzarella'],
  },
  {
    nombre: 'Queso Costeño Merimun',
    descripcion: 'Queso costeño firme y salado. Tradición colombiana de la costa Caribe, perfecto para suero, patacones y frituras.',
    peso: '2.4 kg por unidad',
    unidad: 'por unidad 2.4 kg',
    categoria: 'frescos',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 3,
    etiquetas: ['2.4 kg', 'costeño', 'salado', 'colombiano'],
  },
  {
    nombre: 'Mantequilla Merimun Premium',
    descripcion: 'Mantequilla premium 100% natural elaborada con crema de leche fresca colombiana. Sin aditivos ni conservantes. Pedido mínimo 5 kg.',
    peso: 'Desde 5 kg',
    unidad: 'mínimo 5 kg',
    categoria: 'especiales',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 4,
    etiquetas: ['desde 5 kg', '100% natural', 'sin conservantes'],
  },
  {
    nombre: 'Queso Industrial por Bloque',
    descripcion: 'Bloque de queso artesanal Merimun para industria, restaurantes y eventos. Elaborado con leche fresca en nuestra planta.',
    peso: '12 kg por bloque',
    unidad: 'bloque de 12 kg',
    categoria: 'madurados',
    imagen: null,
    disponible: true,
    destacado: false,
    orden: 5,
    etiquetas: ['12 kg', 'industrial', 'mayorista', 'restaurantes'],
  },
];

// ─────────────────────────────────────────────────────────
const seed = async () => {
  console.log('\n🧀 Cargando 5 productos reales de Merimun...\n');

  // 1 — Borrar productos anteriores
  console.log('🗑️  Borrando productos anteriores...');
  const existing = await db.collection('productos').get();
  if (!existing.empty) {
    const deleteBatch = db.batch();
    existing.docs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`   ${existing.size} productos eliminados.\n`);
  } else {
    console.log('   No había productos anteriores.\n');
  }

  // 2 — Cargar los 5 nuevos
  const batch = db.batch();
  const colRef = db.collection('productos');

  for (const producto of productos) {
    const ref = colRef.doc();
    batch.set(ref, {
      ...producto,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ ${producto.nombre}`);
    console.log(`     Peso: ${producto.peso} | Categoría: ${producto.categoria}\n`);
  }

  await batch.commit();

  console.log('🎉 ¡Listo! 5 productos cargados en Firestore.');
  console.log('\n📸 PENDIENTE — sube las fotos a Firebase Storage:');
  console.log('   1. Firebase Console → Storage → Subir archivos');
  console.log('   2. Copia la URL pública de cada foto');
  console.log('   3. En Firestore → productos → edita el campo "imagen" de cada uno\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});