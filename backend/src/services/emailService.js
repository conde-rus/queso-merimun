import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const verificarConexionEmail = async () => {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY no configurada.');
    return false;
  }
  console.log('✅ Resend configurado correctamente.');
  return true;
};

const textoPago = (formaPago) => {
  if (formaPago === 'nequi') return '📱 Nequi';
  if (formaPago === 'bancolombia') return '🏦 Bancolombia';
  return '⏳ Por confirmar con el equipo';
};

const badgePago = (formaPago) => {
  if (formaPago === 'nequi')
    return `<span style="background:#ec4899;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">📱 Nequi</span>`;
  if (formaPago === 'bancolombia')
    return `<span style="background:#d97706;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">🏦 Bancolombia</span>`;
  return `<span style="background:#6b7280;color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">⏳ Por confirmar</span>`;
};

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

  const EMAIL_TO = process.env.EMAIL_TO || 'ventas@quesomerimun.com';
  const EMAIL_FROM = process.env.EMAIL_FROM || 'La Quesería Merimun <ventas@quesomerimun.com>';

  // ── HTML EMPRESA ────────────────────────────────────────
  const htmlEmpresa = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Georgia,serif;background:#FFF9F0;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#92400E,#D97706);padding:28px 30px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">🧀 Nuevo pedido — ${badgePago(formaPago)}</h1>
    <p style="color:#FDE68A;margin:6px 0 0;font-size:13px;">${fecha}</p>
  </div>
  <div style="padding:28px 30px;">
    <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">👤 Datos del cliente</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #FEF3C7;"><td style="padding:10px 0;color:#9CA3AF;">Nombre</td><td style="padding:10px 0;font-weight:600;text-align:right;">${nombre}</td></tr>
      <tr style="border-bottom:1px solid #FEF3C7;"><td style="padding:10px 0;color:#9CA3AF;">Correo</td><td style="padding:10px 0;text-align:right;"><a href="mailto:${correo}" style="color:#D97706;">${correo}</a></td></tr>
      <tr style="border-bottom:1px solid #FEF3C7;"><td style="padding:10px 0;color:#9CA3AF;">WhatsApp</td><td style="padding:10px 0;text-align:right;"><a href="https://wa.me/57${telefono?.replace(/\D/g,'')}" style="color:#D97706;">📲 ${telefono}</a></td></tr>
      <tr><td style="padding:10px 0;color:#9CA3AF;">Tipo</td><td style="padding:10px 0;font-weight:600;text-align:right;">${tipoPedido}</td></tr>
    </table>

    <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 8px;">📦 Pedido</p>
    <div style="background:#FFF9F0;border-left:4px solid #D97706;padding:14px 16px;border-radius:0 8px 8px 0;font-style:italic;color:#374151;font-size:14px;line-height:1.7;">${mensaje}</div>

    <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 8px;">📍 Dirección</p>
    <div style="background:#F0FDF4;border-left:4px solid #22C55E;padding:14px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#374151;">
      <strong>${dir.direccion}</strong>${dir.barrio ? ' — ' + dir.barrio : ''}<br>
      ${dir.ciudad}${dir.indicaciones ? '<br><em style="color:#6B7280">Indicaciones: ' + dir.indicaciones + '</em>' : ''}
    </div>

    <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;margin:20px 0 8px;">💳 Pago</p>
    <p style="font-weight:600;font-size:14px;">${textoPago(formaPago)}</p>

    ${formaPago === 'pendiente'
      ? `<div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400E;">⏳ Cliente no eligió forma de pago. Contactar para confirmar valor.</div>`
      : comprobante
        ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px 16px;font-size:13px;color:#15803D;">✅ Comprobante adjunto en este correo.</div>`
        : `<div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:8px;padding:12px 16px;font-size:13px;color:#DC2626;">⚠️ Sin comprobante adjunto.</div>`
    }

    <div style="text-align:center;margin-top:24px;">
      <a href="https://wa.me/57${telefono?.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">📲 Contactar por WhatsApp</a>
    </div>
  </div>
  <div style="background:#FEF9EE;padding:16px 30px;text-align:center;font-size:11px;color:#9CA3AF;">Sistema automático · Quesería Merimun · quesomerimun.com</div>
</div>
</body>
</html>`;

  // ── HTML CLIENTE ────────────────────────────────────────
  const htmlCliente = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Georgia,serif;background:#FFF9F0;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#92400E,#D97706);padding:36px 30px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">🧀 ¡Gracias, ${nombre.split(' ')[0]}!</h1>
    <p style="color:#FDE68A;margin:0;font-size:14px;">Recibimos tu pedido correctamente</p>
  </div>
  <div style="padding:28px 30px;">
    <p style="color:#374151;line-height:1.8;font-size:15px;">
      Nuestro equipo revisará tu pedido y te contactará pronto para confirmar
      ${formaPago === 'pendiente' ? 'el valor total y la forma de pago.' : 'los detalles de entrega.'}
    </p>

    <div style="background:#FEF3C7;border-radius:10px;padding:18px;margin:20px 0;">
      <p style="font-size:11px;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:bold;">Resumen de tu pedido</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="border-bottom:1px solid #FEF9EC;"><td style="padding:8px 0;color:#9CA3AF;">Pedido</td><td style="padding:8px 0;font-weight:600;text-align:right;max-width:200px;">${mensaje.substring(0,120)}${mensaje.length>120?'…':''}</td></tr>
        <tr style="border-bottom:1px solid #FEF9EC;"><td style="padding:8px 0;color:#9CA3AF;">Dirección</td><td style="padding:8px 0;font-weight:600;text-align:right;">${direccionCompleta}</td></tr>
        <tr><td style="padding:8px 0;color:#9CA3AF;">Pago</td><td style="padding:8px 0;font-weight:600;text-align:right;color:#D97706;">${textoPago(formaPago)}</td></tr>
      </table>
    </div>

    <p style="font-size:13px;font-weight:bold;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin:20px 0 12px;">¿Qué sigue?</p>
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:50%;background:#D97706;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">1</div>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;"><strong>Revisamos tu pedido</strong> — Verificamos disponibilidad y calculamos el valor.</p>
    </div>
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:50%;background:#D97706;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">2</div>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;"><strong>Te contactamos</strong> — Te escribimos por WhatsApp o correo con el valor y datos de pago.</p>
    </div>
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:50%;background:#D97706;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">3</div>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;"><strong>Confirmas y pagas</strong> — Preparamos y enviamos tu pedido.</p>
    </div>

    <div style="text-align:center;margin-top:20px;">
      <a href="https://wa.me/573007806178" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">📲 Escríbenos por WhatsApp</a>
    </div>

    <p style="color:#6B7280;font-size:13px;margin-top:20px;text-align:center;">
      ¿Dudas? Escríbenos a <a href="mailto:${EMAIL_TO}" style="color:#D97706;">${EMAIL_TO}</a>
    </p>
  </div>
  <div style="background:#FEF9EE;padding:18px 30px;text-align:center;font-size:12px;color:#9CA3AF;border-top:1px solid #FEF3C7;">
    <strong style="color:#92400E;">Quesería Merimun</strong> · quesomerimun.com · Medellín, Colombia
  </div>
</div>
</body>
</html>`;

  // Sin config → log en consola
  if (!process.env.RESEND_API_KEY) {
    console.log('\n📧 [SIN RESEND] Pedido de:', nombre, '| Pago:', formaPago);
    return { simulado: true };
  }

  // Adjuntos
  const attachments = [];
  if (comprobante?.buffer) {
    attachments.push({
      filename: comprobante.originalname || 'comprobante',
      content: comprobante.buffer,
    });
  }

  try {
    // Correo a la empresa
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      subject: `🧀 Nuevo pedido de ${nombre} — ${textoPago(formaPago)}`,
      html: htmlEmpresa,
      attachments,
    });

    // Correo al cliente
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [correo],
      subject: '✅ Recibimos tu pedido — Quesería Merimun',
      html: htmlCliente,
    });

    console.log(`✅ Correos enviados via Resend: empresa(${EMAIL_TO}) + cliente(${correo})`);
    return { enviado: true };
  } catch (err) {
    console.error('❌ Error Resend:', err.message);
    throw err;
  }
};