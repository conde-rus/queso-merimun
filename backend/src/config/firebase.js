import admin from 'firebase-admin';

/**
 * Inicializa Firebase Admin SDK.
 * Las credenciales se leen desde variables de entorno por seguridad.
 * NUNCA incluyas las credenciales directamente en el código.
 */
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // Las \n en la clave privada vienen como string literal desde el .env
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
};

initFirebase();

export const db = admin.firestore();
export const storage = admin.storage();
export default admin;
