const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: 'https://quesomerimun.com' });
const Busboy = require('busboy');

// ── Inicializar Firebase Admin ──────────────────────────
initializeApp();
const db = getFirestore();

// ── Configuración de correo ─────────────────────────────
// Define estas variables en Firebase Functions config:
// firebase functions:secrets:set EMAIL_USER
// firebase functions:secrets:set EMAIL_PASS
const getTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ── Helper: parsear multipart/form-data ────────────────
const parsearFormData = (req) =>
  new Promise((resolve, reject) => {
    const campos = {};
    let archivoBuffer = null;
    let archivoNombre = null;
    let archivoMime = null;

    const busboy = Busboy({ headers: req.headers });

    busboy.on('field', (name, val) => {
      campos[name] = val;
    });

    busboy.on('file', (name, file, info) => {
      archivoNombre = info.filename;
      archivoMime = info.mimeType;
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('close', () => {
        archivoBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('close', () =>
      resolve({ campos, archivoBuffer, archivoNombre, archivoMime })
    );
    busboy.on('error', reject);

    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });

// ══════════════════════════════════════════════════════════
// FUNCIÓN 1: GET /api/productos
// ══════════════════════════════════════════════════════════
exports.productos = onRequest({ region: 'us-central1' }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Método no permitido.' });
    }

    try {
      const { categoria } = req.query;
      let query = db.collection('productos').where('disponible', '==', true);

      if (categoria) {
        const validas = ['frescos', 'madurados', 'combos', 'especiales'];
        if (!validas.includes(categoria)) {
          return res.status(400).json({ success: false, error: 'Categoría inválida.' });
        }
        query = query.where('categoria', '==', categoria);
      }

      query = query.orderBy('orden', 'asc');
      const snapshot = await query.get();

      const productos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        precio: Number(doc.data().precio) || 0,
        destacado: Boolean(doc.data().destacado),
      }));

      return res.json({ success: true, total: productos.length, data: productos });
    } catch (error) {
      console.error('Error productos:', error);
      return res.status(500).json({ success: false, error: 'Error obteniendo productos.' });
    }
  });
});

// ══════════════════════════════════════════════════════════
// FUNCIÓN 2: POST /api/pedidos
// ══════════════════════════════════════════════════════════
exports.pedidos = onRequest({ region: 'us-central1' }, (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Método no permitido.' });
    }

    try {
      // Parsear el form-data con el comprobante
      const { campos, archivoBuffer, archivoNombre, archivoMime } =
        await parsearFormData(req);

      const { nombre, correo, telefono, direccion, barrio, ciudad,
              indicaciones, mensaje, tipoPedido, formaPago } = campos;

      // Validaciones básicas
      const errores = [];
      if (!nombre || nombre.trim().length < 2) errores.push('Nombre requerido.');
      if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.push('Correo inválido.');
      if (!telefono || !telefono.trim()) errores.push('Teléfono requerido.');
      if (!direccion || direccion.trim().length < 5) errores.push('Dirección requerida.');
      if (!ciudad || ciudad.trim().length < 2) errores.push('Ciudad requerida.');
      if (!mensaje || mensaje.trim().length < 10) errores.push('Describe tu pedido.');
      if (!['nequi', 'bancolombia'].includes(formaPago)) errores.push('Forma de pago inválida.');

      if (errores.length) {
        return res.status(422).json({ success: false, error: errores.join(' ') });
      }

      // Guardar en Firestore
      const nuevoPedido = {
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim(),
        tipoPedido: tipoPedido || 'pedido',
        direccionEntrega: {
          direccion: direccion.trim(),
          barrio: barrio?.trim() || '',
          ciudad: ciudad.trim(),
          indicaciones: indicaciones?.trim() || '',
        },
        mensaje: mensaje.trim(),
        formaPago,
        tieneComprobante: !!archivoBuffer,
        comprobanteNombre: archivoNombre || null,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
      };

      const docRef = await db.collection('pedidos').add(nuevoPedido);
      console.log(`Pedido guardado: ${docRef.id} de ${nombre}`);

      // Enviar correos (sin bloquear la respuesta)
      enviarCorreos(nuevoPedido, archivoBuffer, archivoNombre, archivoMime)
        .catch((e) => console.error('Error correo:', e.message));

      return res.status(201).json({
        success: true,
        mensaje: '¡Pedido recibido! Te confirmaremos pronto.',
        id: docRef.id,
      });
    } catch (error) {
      console.error('Error pedido:', error);
      return res.status(500).json({ success: false, error: 'Error procesando el pedido.' });
    }
  });
});

// ══════════════════════════════════════════════════════════
// HELPER: Enviar correos
// ══════════════════════════════════════════════════════════
async function enviarCorreos(pedido, archivoBuffer, archivoNombre, archivoMime) {
  const EMAIL_TO = process.env.EMAIL_TO || 'ventas@quesomerimun.com';
  const EMAIL_FROM = process.env.EMAIL_FROM || 'La Quesería <ventas@quesomerimun.com>';

  if (!process.env.EMAIL_USER) {
    console.log('[SIN EMAIL CONFIG] Pedido de:', pedido.nombre, '- Pago:', pedido.formaPago);
    return;
  }

  const { nombre, correo, telefono, mensaje, formaPago, direccionEntrega, fechaCreacion } = pedido;
  const dir = direccionEntrega;
  const direccionCompleta = [dir.direccion, dir.barrio, dir.ciudad, dir.indicaciones]
    .filter(Boolean).join(', ');
  const fecha = new Date(fechaCreacion).toLocaleString('es-CO', { timeZone: 'America/Bogota' });

  const htmlEmpresa = `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#92400E,#D97706);padding:28px 30px">
      <h1 style="color:#fff;margin:0;font-size:20px">🧀 Nuevo pedido — ${formaPago === 'nequi' ? '📱 Nequi' : '🏦 Bancolombia'}</h1>
      <p style="color:#FDE68A;margin:6px 0 0;font-size:13px">${fecha}</p>
    </div>
    <div style="padding:28px 30px">
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="color:#9CA3AF;padding:10px 0;border-bottom:1px solid #FEF3C7">Cliente</td><td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #FEF3C7">${nombre}</td></tr>
        <tr><td style="color:#9CA3AF;padding:10px 0;border-bottom:1px solid #FEF3C7">Correo</td><td style="text-align:right;padding:10px 0;border-bottom:1px solid #FEF3C7"><a href="mailto:${correo}" style="color:#D97706">${correo}</a></td></tr>
        <tr><td style="color:#9CA3AF;padding:10px 0;border-bottom:1px solid #FEF3C7">WhatsApp</td><td style="text-align:right;padding:10px 0;border-bottom:1px solid #FEF3C7"><a href="https://wa.me/57${telefono?.replace(/\D/g,'')}" style="color:#D97706">📲 ${telefono}</a></td></tr>
        <tr><td style="color:#9CA3AF;padding:10px 0;border-bottom:1px solid #FEF3C7">Dirección</td><td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #FEF3C7">${direccionCompleta}</td></tr>
        <tr><td style="color:#9CA3AF;padding:10px 0;border-bottom:1px solid #FEF3C7">Forma de pago</td><td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid #FEF3C7">${formaPago === 'nequi' ? '📱 Nequi' : '🏦 Bancolombia'}</td></tr>
        <tr><td style="color:#9CA3AF;padding:10px 0">Comprobante</td><td style="text-align:right;padding:10px 0">${archivoBuffer ? '✅ Adjunto en este correo' : '⚠️ No enviado'}</td></tr>
      </table>
      <div style="background:#FFF9F0;border-left:4px solid #D97706;padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;font-style:italic;color:#374151;font-size:14px">${mensaje}</div>
      <div style="text-align:center;margin-top:20px">
        <a href="mailto:${correo}?subject=Confirmación de tu pedido - La Quesería" style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Responder al cliente →</a>
      </div>
    </div>
  </div>`;

  const htmlCliente = `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#92400E,#D97706);padding:36px 30px;text-align:center">
      <h1 style="color:#fff;margin:0 0 6px;font-size:24px">🧀 ¡Gracias, ${nombre.split(' ')[0]}!</h1>
      <p style="color:#FDE68A;margin:0;font-size:14px">Recibimos tu pedido y comprobante de pago</p>
    </div>
    <div style="padding:28px 30px">
      <p style="color:#374151;line-height:1.8;font-size:15px">Tu pedido está en revisión. En cuanto confirmemos el pago te notificaremos y coordinaremos la entrega.</p>
      <div style="background:#FEF3C7;border-radius:10px;padding:18px;margin:20px 0">
        <p style="font-size:11px;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold">Resumen de tu pedido</p>
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="color:#9CA3AF;padding:8px 0;border-bottom:1px solid #FEF9EC">Pedido</td><td style="font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #FEF9EC">${mensaje.substring(0,100)}${mensaje.length>100?'…':''}</td></tr>
          <tr><td style="color:#9CA3AF;padding:8px 0;border-bottom:1px solid #FEF9EC">Dirección</td><td style="font-weight:600;text-align:right;padding:8px 0;border-bottom:1px solid #FEF9EC">${direccionCompleta}</td></tr>
          <tr><td style="color:#9CA3AF;padding:8px 0">Pago</td><td style="font-weight:600;text-align:right;padding:8px 0;color:#D97706">${formaPago === 'nequi' ? '📱 Nequi' : '🏦 Bancolombia'} ⏳ Verificando</td></tr>
        </table>
      </div>
      <p style="color:#6B7280;font-size:13px">¿Dudas? Escríbenos a <a href="mailto:${EMAIL_TO}" style="color:#D97706">${EMAIL_TO}</a> mencionando tu nombre: <strong>${nombre}</strong>.</p>
    </div>
    <div style="background:#FEF9EE;padding:16px 30px;text-align:center;font-size:12px;color:#9CA3AF;border-top:1px solid #FEF3C7">
      <strong style="color:#92400E">La Quesería de Miramu</strong> · Medellín, Colombia
    </div>
  </div>`;

  const attachments = archivoBuffer
    ? [{ filename: archivoNombre || 'comprobante', content: archivoBuffer, contentType: archivoMime }]
    : [];

  const transporter = getTransporter();
  await Promise.all([
    transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `🧀 Nuevo pedido de ${nombre} — ${formaPago === 'nequi' ? 'Nequi' : 'Bancolombia'}`,
      html: htmlEmpresa,
      attachments,
    }),
    transporter.sendMail({
      from: EMAIL_FROM,
      to: correo,
      subject: '✅ Recibimos tu pedido — La Quesería de Miramu',
      html: htmlCliente,
    }),
  ]);
}