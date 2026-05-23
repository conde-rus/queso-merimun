import admin from 'firebase-admin';

/**
 * Inicializa Firebase Admin SDK.
 * Maneja tanto \n literales (Railway) como saltos de línea reales.
 */
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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