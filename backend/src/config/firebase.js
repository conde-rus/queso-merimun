import admin from 'firebase-admin';

/**
 * Inicializa Firebase Admin SDK.
 * Maneja tanto \n literales (Railway) como saltos de línea reales.
 */
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!privateKey) {
    console.error('❌ FIREBASE_PRIVATE_KEY no está definida en las variables de entorno');
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
};

try {
  initFirebase();
  console.log('✅ Firebase Admin SDK inicializado correctamente');
} catch (err) {
  console.error('❌ Error inicializando Firebase:', err.message);
}

export const db = admin.firestore();
export const storage = admin.storage();
export default admin;