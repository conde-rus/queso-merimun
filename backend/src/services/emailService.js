import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const verificarConexionEmail = async () => {
  if (!process.env.EMAIL_USER) {
    console.log('⚠️  Email no configurado. Los correos se simularán en consola.');
    return false;
  }
  try {
    await transporter.verify();
    console.log('✅ Servicio de correo conectado.');
    return true;
  } catch (error) {
    console.error('⚠️  Error de correo:', error.message);
    return false;
  }
};

// Badges de forma de pago para el HTML
const badgePago = (formaPago) =>
  formaPago === 'nequi'
    ? `<span style="background:#ec4899;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">📱 Nequi</span>`
    : `<span style="background:#d97706;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">🏦 Bancolombia</span>`;

/**
 * Envía correo a la EMPRESA con todos los datos del pedido y el comprobante adjunto.
 * Envía correo de CONFIRMACIÓN al CLIENTE.
 *
 * @param {Object} pedido      - Datos del pedido guardados en Firestore
 * @param {Object} comprobante - Objeto multer con { buffer, originalname, mimetype }
 */
export const enviarNotificacionPedido = async (pedido, comprobante) => {
  const {
    nombre, correo, telefono, mensaje, tipoPedido, formaPago,
    direccionEntrega, fechaCreacion,
  } = pedido;

  const dir = direccionEntrega;
  const direccionCompleta = [dir.direccion, dir.barrio, dir.ciudad, dir.indicaciones]
    .filter(Boolean).join(', ');

  const fecha = new Date(fechaCreacion).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  // ── CORREO PARA LA EMPRESA ──────────────────────────────
  const htmlEmpresa = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; background:#FFF9F0; margin:0; padding:20px; }
  .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.08); }
  .header { background:linear-gradient(135deg,#92400E,#D97706); padding:28px 30px; }
  .header h1 { color:#fff; margin:0; font-size:20px; }
  .header p { color:#FDE68A; margin:6px 0 0; font-size:13px; }
  .body { padding:28px 30px; }
  .section-title { font-size:11px; color:#9CA3AF; text-transform:uppercase; letter-spacing:1.5px; margin:20px 0 8px; }
  .field { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #FEF3C7; font-size:14px; }
  .field:last-child { border:none; }
  .label { color:#9CA3AF; }
  .value { color:#1F2937; font-weight:600; text-align:right; max-width:300px; }
  .msg-box { background:#FFF9F0; border-left:4px solid #D97706; padding:14px 16px; border-radius:0 8px 8px 0; font-style:italic; color:#374151; font-size:14px; line-height:1.7; }
  .dir-box { background:#F0FDF4; border-left:4px solid #22C55E; padding:14px 16px; border-radius:0 8px 8px 0; font-size:14px; color:#374151; }
  .cta { display:inline-block; background:#D97706; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px; margin-top:20px; }
  .footer { background:#FEF9EE; padding:16px 30px; text-align:center; font-size:11px; color:#9CA3AF; }
  .comprobante-note { background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:12px 16px; font-size:13px; color:#15803D; margin-top:16px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🧀 Nuevo pedido recibido — ${badgePago(formaPago)}</h1>
    <p>${fecha}</p>
  </div>
  <div class="body">

    <p class="section-title">👤 Datos del cliente</p>
    <div class="field"><span class="label">Nombre</span><span class="value">${nombre}</span></div>
    <div class="field"><span class="label">Correo</span><span class="value"><a href="mailto:${correo}" style="color:#D97706">${correo}</a></span></div>
    <div class="field"><span class="label">Teléfono / WhatsApp</span><span class="value"><a href="https://wa.me/57${telefono?.replace(/\D/g,'')}" style="color:#D97706">📲 ${telefono}</a></span></div>
    <div class="field"><span class="label">Tipo de solicitud</span><span class="value">${tipoPedido}</span></div>

    <p class="section-title">📦 Pedido</p>
    <div class="msg-box">${mensaje}</div>

    <p class="section-title">📍 Dirección de entrega</p>
    <div class="dir-box">
      <strong>${dir.direccion}</strong>${dir.barrio ? ' — ' + dir.barrio : ''}<br>
      ${dir.ciudad}${dir.indicaciones ? '<br><em style="color:#6B7280">Indicaciones: ' + dir.indicaciones + '</em>' : ''}
    </div>

    <p class="section-title">💳 Pago</p>
    <div class="field"><span class="label">Forma de pago</span><span class="value">${formaPago === 'nequi' ? '📱 Nequi' : '🏦 Bancolombia'}</span></div>

    ${comprobante
      ? `<div class="comprobante-note">✅ <strong>Comprobante adjunto</strong> — Revisa el archivo adjunto en este correo.</div>`
      : `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;font-size:13px;color:#DC2626;margin-top:16px;">⚠️ No se recibió comprobante de pago.</div>`
    }

    <div style="text-align:center">
      <a href="mailto:${correo}?subject=Confirmación de tu pedido - La Quesería" class="cta">
        Responder al cliente →
      </a>
    </div>
  </div>
  <div class="footer">Sistema automático de pedidos · La Quesería de Miramu</div>
</div>
</body>
</html>`;

  // ── CORREO PARA EL CLIENTE ──────────────────────────────
  const htmlCliente = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; background:#FFF9F0; margin:0; padding:20px; }
  .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.08); }
  .header { background:linear-gradient(135deg,#92400E,#D97706); padding:36px 30px; text-align:center; }
  .header h1 { color:#fff; margin:0 0 6px; font-size:24px; }
  .header p { color:#FDE68A; margin:0; font-size:14px; }
  .body { padding:28px 30px; }
  .highlight { background:#FEF3C7; border-radius:10px; padding:18px; margin:20px 0; }
  .field { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #FEF3C7; font-size:13px; }
  .field:last-child { border:none; }
  .label { color:#9CA3AF; }
  .value { color:#1F2937; font-weight:600; }
  .steps { margin:20px 0; }
  .step { display:flex; gap:14px; margin-bottom:14px; align-items:flex-start; }
  .step-num { width:28px; height:28px; border-radius:50%; background:#D97706; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; flex-shrink:0; margin-top:2px; }
  .footer { background:#FEF9EE; padding:18px 30px; text-align:center; font-size:12px; color:#9CA3AF; border-top:1px solid #FEF3C7; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🧀 ¡Gracias, ${nombre.split(' ')[0]}!</h1>
    <p>Recibimos tu pedido y comprobante de pago</p>
  </div>
  <div class="body">
    <p style="color:#374151;line-height:1.8;font-size:15px;">
      Tu pedido está en revisión. En cuanto confirmemos el pago, te notificaremos
      y coordinaremos la entrega a tu dirección.
    </p>

    <div class="highlight">
      <p style="font-size:11px;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">
        Resumen de tu pedido
      </p>
      <div class="field"><span class="label">Pedido</span><span class="value" style="max-width:250px;text-align:right">${mensaje.substring(0,120)}${mensaje.length>120?'…':''}</span></div>
      <div class="field"><span class="label">Dirección</span><span class="value" style="max-width:250px;text-align:right">${direccionCompleta}</span></div>
      <div class="field"><span class="label">Forma de pago</span><span class="value">${formaPago === 'nequi' ? '📱 Nequi' : '🏦 Bancolombia'}</span></div>
      <div class="field"><span class="label">Estado</span><span class="value" style="color:#D97706">⏳ Verificando pago</span></div>
    </div>

    <p style="font-size:13px;font-weight:bold;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin:20px 0 12px;">
      ¿Qué sigue?
    </p>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><p style="margin:0;font-size:14px;color:#374151;line-height:1.6"><strong>Verificamos tu pago</strong> — Revisamos el comprobante que enviaste.</p></div>
      <div class="step"><div class="step-num">2</div><p style="margin:0;font-size:14px;color:#374151;line-height:1.6"><strong>Confirmación</strong> — Te escribimos al correo o WhatsApp con la confirmación.</p></div>
      <div class="step"><div class="step-num">3</div><p style="margin:0;font-size:14px;color:#374151;line-height:1.6"><strong>Preparación y envío</strong> — Preparamos tu pedido y lo enviamos a tu dirección.</p></div>
    </div>

    <p style="color:#6B7280;font-size:13px;margin-top:20px;">
      ¿Alguna duda? Escríbenos a
      <a href="mailto:${process.env.EMAIL_TO}" style="color:#D97706">${process.env.EMAIL_TO}</a>
      o por WhatsApp. Menciona tu nombre: <strong>${nombre}</strong>.
    </p>
  </div>
  <div class="footer">
    <strong style="color:#92400E">La Quesería de Miramu</strong><br>
    Quesos artesanales · Medellín, Colombia
  </div>
</div>
</body>
</html>`;

  // ── Adjuntos para el correo de la empresa ──
  const attachments = [];
  if (comprobante?.buffer) {
    attachments.push({
      filename: comprobante.originalname || 'comprobante-pago',
      content: comprobante.buffer,
      contentType: comprobante.mimetype,
    });
  }

  // Si no hay config de correo, simular en consola
  if (!process.env.EMAIL_USER) {
    console.log('\n📧 [SIMULACIÓN] Correos que se enviarían:');
    console.log(`   → Empresa (${process.env.EMAIL_TO}): "Nuevo pedido de ${nombre} - ${formaPago}"`);
    console.log(`   → Cliente (${correo}): "Confirmación de pedido"`);
    console.log(`   → Comprobante adjunto: ${comprobante ? comprobante.originalname : 'ninguno'}`);
    console.log(`   → Dirección: ${direccionCompleta}\n`);
    return { simulado: true };
  }

  // Envío real en paralelo
  await Promise.all([
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `🧀 Nuevo pedido de ${nombre} — ${formaPago === 'nequi' ? 'Nequi' : 'Bancolombia'}`,
      html: htmlEmpresa,
      attachments,
    }),
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: correo,
      subject: '✅ Recibimos tu pedido — La Quesería de Miramu',
      html: htmlCliente,
    }),
  ]);

  return { enviado: true };
};