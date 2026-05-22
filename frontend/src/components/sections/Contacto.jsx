import { useState, useRef } from 'react';
import { enviarPedidoConPago } from '../../services/api';

// ─────────────────────────────────────────────────────────────
// CONFIGURA AQUÍ TUS DATOS DE PAGO
// ─────────────────────────────────────────────────────────────
const DATOS_PAGO = {
  nequi: {
    numero: '300 000 0000',           // ← Tu número Nequi
    nombre: 'La Quesería de Miramu',
    // Link directo de cobro Nequi (genera el tuyo en app.nequi.com.co)
    linkPago: 'https://link.nequi.com.co/stores/la-queseria', // ← Tu link real
  },
  bancolombia: {
    tipoCuenta: 'Ahorros',
    numeroCuenta: '000-000000-00',    // ← Tu número de cuenta
    titular: 'La Quesería de Miramu SAS',
    nit: '900.000.000-0',             // ← Tu NIT o cédula
    banco: 'Bancolombia',
  },
};
// ─────────────────────────────────────────────────────────────

const TIPOS = [
  { value: 'pedido', label: '🛒 Pedido de productos' },
  { value: 'cotizacion', label: '💰 Cotización' },
  { value: 'evento', label: '🎉 Evento especial' },
  { value: 'consulta', label: '❓ Consulta general' },
];

const PASOS = ['Tus datos', 'Tu pedido', 'Forma de pago', 'Comprobante'];

const inputBase =
  'w-full px-4 py-3 rounded-xl border font-body text-sm text-corteza-800 placeholder-corteza-300 transition-all duration-200 outline-none focus:ring-2 focus:ring-queso-400 focus:border-transparent bg-white';

// ── Indicador de pasos ─────────────────────────────────────
const PasoIndicador = ({ pasoActual }) => (
  <div className="flex items-center justify-between mb-8">
    {PASOS.map((nombre, i) => {
      const num = i + 1;
      const activo = num === pasoActual;
      const completo = num < pasoActual;
      return (
        <div key={nombre} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-body transition-all duration-300 ${
                completo
                  ? 'bg-green-500 text-white'
                  : activo
                  ? 'bg-queso-600 text-white ring-4 ring-queso-200'
                  : 'bg-corteza-100 text-corteza-400'
              }`}
            >
              {completo ? '✓' : num}
            </div>
            <span
              className={`text-xs mt-1 font-body hidden sm:block ${
                activo ? 'text-queso-700 font-medium' : 'text-corteza-400'
              }`}
            >
              {nombre}
            </span>
          </div>
          {i < PASOS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                completo ? 'bg-green-400' : 'bg-corteza-100'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Componente principal ───────────────────────────────────
const Contacto = ({ productoPreseleccionado, onLimpiarProducto }) => {
  const [paso, setPaso] = useState(1);
  const [formaPago, setFormaPago] = useState(null); // 'nequi' | 'bancolombia'
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState(null); // null | 'exito' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [errores, setErrores] = useState({});
  const fileRef = useRef();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    barrio: '',
    ciudad: 'Medellín',
    indicaciones: '',
    tipoPedido: 'pedido',
    mensaje: productoPreseleccionado
      ? `Quiero pedir: "${productoPreseleccionado.nombre}". `
      : '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }));
  };

  const onArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrores((p) => ({ ...p, comprobante: 'La imagen no puede superar 5MB.' }));
      return;
    }
    setComprobante(file);
    setComprobantePreview(URL.createObjectURL(file));
    setErrores((p) => ({ ...p, comprobante: '' }));
  };

  // Validaciones por paso
  const validarPaso1 = () => {
    const e = {};
    if (!form.nombre.trim() || form.nombre.length < 2) e.nombre = 'Ingresa tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido.';
    if (!form.telefono.trim()) e.telefono = 'Ingresa tu teléfono o WhatsApp.';
    if (!form.direccion.trim()) e.direccion = 'Ingresa tu dirección de entrega.';
    if (!form.ciudad.trim()) e.ciudad = 'Ingresa la ciudad.';
    return e;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!form.mensaje.trim() || form.mensaje.length < 10)
      e.mensaje = 'Describe tu pedido (mínimo 10 caracteres).';
    return e;
  };

  const siguiente = () => {
    if (paso === 1) {
      const e = validarPaso1();
      if (Object.keys(e).length) { setErrores(e); return; }
    }
    if (paso === 2) {
      const e = validarPaso2();
      if (Object.keys(e).length) { setErrores(e); return; }
    }
    if (paso === 3 && !formaPago) {
      setErrores({ pago: 'Selecciona una forma de pago.' });
      return;
    }
    setPaso((p) => p + 1);
  };

  const enviar = async () => {
    if (!comprobante) {
      setErrores({ comprobante: 'Adjunta el comprobante de pago.' });
      return;
    }
    setEnviando(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('formaPago', formaPago);
      data.append('comprobante', comprobante, comprobante.name);
      await enviarPedidoConPago(data);
      setEstado('exito');
    } catch (err) {
      setEstado('error');
      setErrorMsg(err.message || 'Error al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // ── PANTALLA DE ÉXITO ──────────────────────────────────
  if (estado === 'exito') {
    return (
      <section id="contacto" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-4xl">
              🎉
            </div>
            <h2 className="font-display font-bold text-corteza-800 text-2xl mb-2">
              ¡Pedido recibido con éxito!
            </h2>
            <p className="font-body text-corteza-500 mb-6 leading-relaxed">
              Recibimos tu comprobante de pago. En breve confirmaremos tu pedido
              al correo <strong className="text-queso-700">{form.correo}</strong>.
            </p>

            {/* Resumen del pedido */}
            <div className="bg-queso-50 rounded-2xl p-5 text-left mb-6 space-y-2">
              <p className="font-body text-xs text-queso-600 uppercase tracking-widest font-bold mb-3">
                Resumen de tu pedido
              </p>
              {[
                ['👤 Cliente', form.nombre],
                ['📦 Pedido', form.mensaje],
                ['📍 Entrega', `${form.direccion}${form.barrio ? ', ' + form.barrio : ''} — ${form.ciudad}`],
                ['💳 Pago', formaPago === 'nequi' ? 'Nequi' : 'Bancolombia'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-sm font-body">
                  <span className="text-corteza-500 min-w-[110px]">{k}:</span>
                  <span className="text-corteza-800 font-medium">{v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setEstado(null); setPaso(1); setForm({ nombre:'',correo:'',telefono:'',direccion:'',barrio:'',ciudad:'Medellín',indicaciones:'',tipoPedido:'pedido',mensaje:'' }); setFormaPago(null); setComprobante(null); setComprobantePreview(null); }}
              className="px-8 py-3 rounded-full bg-queso-600 text-white font-body font-bold hover:bg-queso-700 transition-colors"
            >
              Hacer otro pedido
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* ── COLUMNA IZQUIERDA ── */}
          <div>
            <span className="font-body text-queso-600 text-sm font-medium tracking-widest uppercase">
              — Hablemos —
            </span>
            <h2 className="font-display font-bold text-corteza-800 mt-2 mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              ¿Quieres hacer un pedido?
            </h2>
            <p className="font-body text-corteza-500 leading-relaxed mb-8">
              Completa el formulario, elige cómo pagar y adjunta tu comprobante.
              Te confirmamos en menos de 24 horas.
            </p>

            <div className="space-y-5">
              {[
                { icon: '📱', label: 'WhatsApp', val: '+57 300 000 0000' },
                { icon: '📧', label: 'Correo', val: 'ventas@laqueseria.com' },
                { icon: '📍', label: 'Zona de entrega', val: 'Medellín y área metropolitana' },
                { icon: '🕐', label: 'Horario', val: 'Lun–Sáb 8am–6pm' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-queso-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-body text-xs text-corteza-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-body text-corteza-700 font-medium">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formas de pago aceptadas */}
            <div className="mt-8 p-5 rounded-2xl bg-queso-50 border border-queso-200">
              <p className="font-body text-xs text-queso-700 uppercase tracking-widest font-bold mb-3">
                Formas de pago aceptadas
              </p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-queso-200">
                  <span className="text-xl">📱</span>
                  <span className="font-body text-sm font-medium text-corteza-700">Nequi</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-queso-200">
                  <span className="text-xl">🏦</span>
                  <span className="font-body text-sm font-medium text-corteza-700">Bancolombia</span>
                </div>
              </div>
            </div>

            {/* Producto preseleccionado */}
            {productoPreseleccionado && (
              <div className="mt-6 p-4 rounded-xl bg-queso-50 border border-queso-200 flex items-center gap-3">
                <span className="text-2xl">🧀</span>
                <div className="flex-1">
                  <p className="font-body text-xs text-queso-600 uppercase tracking-wide">Producto seleccionado</p>
                  <p className="font-display font-bold text-corteza-800">{productoPreseleccionado.nombre}</p>
                </div>
                <button onClick={onLimpiarProducto} className="text-corteza-400 hover:text-corteza-600 text-xl">×</button>
              </div>
            )}
          </div>

          {/* ── COLUMNA DERECHA: FORMULARIO POR PASOS ── */}
          <div className="bg-white rounded-3xl shadow-xl border border-corteza-100 p-8">
            <PasoIndicador pasoActual={paso} />

            {/* ══ PASO 1: DATOS PERSONALES + DIRECCIÓN ══ */}
            {paso === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-corteza-800 text-lg mb-4">
                  Tus datos de contacto y entrega
                </h3>

                {/* Nombre */}
                <div>
                  <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Nombre completo *</label>
                  <input type="text" name="nombre" value={form.nombre} onChange={onChange}
                    placeholder="Tu nombre y apellido"
                    className={`${inputBase} ${errores.nombre ? 'border-red-400' : 'border-corteza-200'}`} />
                  {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
                </div>

                {/* Correo */}
                <div>
                  <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Correo electrónico *</label>
                  <input type="email" name="correo" value={form.correo} onChange={onChange}
                    placeholder="tu@correo.com"
                    className={`${inputBase} ${errores.correo ? 'border-red-400' : 'border-corteza-200'}`} />
                  {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
                </div>

                {/* Teléfono + Tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Teléfono / WhatsApp *</label>
                    <input type="tel" name="telefono" value={form.telefono} onChange={onChange}
                      placeholder="+57 300..."
                      className={`${inputBase} ${errores.telefono ? 'border-red-400' : 'border-corteza-200'}`} />
                    {errores.telefono && <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>}
                  </div>
                  <div>
                    <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Tipo de solicitud</label>
                    <select name="tipoPedido" value={form.tipoPedido} onChange={onChange}
                      className={`${inputBase} border-corteza-200 cursor-pointer`}>
                      {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* ── DIRECCIÓN DE ENTREGA ── */}
                <div className="pt-2">
                  <p className="font-body text-xs text-queso-600 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                    📍 Dirección de entrega
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Dirección *</label>
                      <input type="text" name="direccion" value={form.direccion} onChange={onChange}
                        placeholder="Ej: Calle 50 #35-20, Apto 301"
                        className={`${inputBase} ${errores.direccion ? 'border-red-400' : 'border-corteza-200'}`} />
                      {errores.direccion && <p className="text-red-500 text-xs mt-1">{errores.direccion}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Barrio</label>
                        <input type="text" name="barrio" value={form.barrio} onChange={onChange}
                          placeholder="Ej: Laureles"
                          className={`${inputBase} border-corteza-200`} />
                      </div>
                      <div>
                        <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">Ciudad *</label>
                        <input type="text" name="ciudad" value={form.ciudad} onChange={onChange}
                          placeholder="Medellín"
                          className={`${inputBase} ${errores.ciudad ? 'border-red-400' : 'border-corteza-200'}`} />
                        {errores.ciudad && <p className="text-red-500 text-xs mt-1">{errores.ciudad}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">
                        Indicaciones adicionales
                      </label>
                      <input type="text" name="indicaciones" value={form.indicaciones} onChange={onChange}
                        placeholder="Ej: Timbre 3, portería verde, preguntar por..."
                        className={`${inputBase} border-corteza-200`} />
                    </div>
                  </div>
                </div>

                <button onClick={siguiente}
                  className="w-full py-3.5 rounded-xl bg-queso-600 hover:bg-queso-700 text-white font-body font-bold transition-all hover:shadow-lg mt-2">
                  Siguiente → Mi pedido
                </button>
              </div>
            )}

            {/* ══ PASO 2: DETALLE DEL PEDIDO ══ */}
            {paso === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-corteza-800 text-lg mb-4">
                  ¿Qué quieres pedir?
                </h3>

                <div>
                  <label className="font-body text-sm font-medium text-corteza-600 block mb-1.5">
                    Describe tu pedido *
                  </label>
                  <textarea name="mensaje" value={form.mensaje} onChange={onChange} rows={6}
                    placeholder="Ej: Quiero 2kg de queso campesino, 1kg de mozzarella y una tabla gourmet para 4 personas..."
                    className={`${inputBase} resize-none ${errores.mensaje ? 'border-red-400' : 'border-corteza-200'}`} />
                  <div className="flex justify-between mt-1">
                    {errores.mensaje
                      ? <p className="text-red-500 text-xs">{errores.mensaje}</p>
                      : <span />}
                    <p className="text-xs text-corteza-300">{form.mensaje.length}/2000</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-queso-50 border border-queso-100 text-sm font-body text-corteza-600">
                  💡 Incluye cantidades, variedades y cualquier preferencia especial.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setPaso(1)}
                    className="flex-1 py-3.5 rounded-xl border border-corteza-200 text-corteza-600 font-body font-medium hover:bg-corteza-50 transition-colors">
                    ← Atrás
                  </button>
                  <button onClick={siguiente}
                    className="flex-1 py-3.5 rounded-xl bg-queso-600 hover:bg-queso-700 text-white font-body font-bold transition-all hover:shadow-lg">
                    Siguiente → Pagar
                  </button>
                </div>
              </div>
            )}

            {/* ══ PASO 3: FORMA DE PAGO ══ */}
            {paso === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-corteza-800 text-lg mb-4">
                  Elige tu forma de pago
                </h3>

                {/* Opción Nequi */}
                <button
                  onClick={() => { setFormaPago('nequi'); setErrores({}); }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    formaPago === 'nequi'
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-corteza-200 hover:border-pink-300 hover:bg-pink-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                      📱
                    </div>
                    <div className="flex-1">
                      <p className="font-body font-bold text-corteza-800 text-base">Nequi</p>
                      <p className="font-body text-corteza-500 text-sm">Transferencia inmediata al instante</p>
                      <p className="font-body text-pink-600 font-medium text-sm mt-1">
                        📲 {DATOS_PAGO.nequi.numero}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                      formaPago === 'nequi' ? 'border-pink-500 bg-pink-500' : 'border-corteza-300'
                    }`}>
                      {formaPago === 'nequi' && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                    </div>
                  </div>
                </button>

                {/* Opción Bancolombia */}
                <button
                  onClick={() => { setFormaPago('bancolombia'); setErrores({}); }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    formaPago === 'bancolombia'
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-corteza-200 hover:border-yellow-300 hover:bg-yellow-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                      🏦
                    </div>
                    <div className="flex-1">
                      <p className="font-body font-bold text-corteza-800 text-base">Bancolombia</p>
                      <p className="font-body text-corteza-500 text-sm">Transferencia bancaria</p>
                      <p className="font-body text-yellow-700 font-medium text-sm mt-1">
                        Cta. {DATOS_PAGO.bancolombia.tipoCuenta} · {DATOS_PAGO.bancolombia.numeroCuenta}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                      formaPago === 'bancolombia' ? 'border-yellow-500 bg-yellow-500' : 'border-corteza-300'
                    }`}>
                      {formaPago === 'bancolombia' && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
                    </div>
                  </div>
                </button>

                {errores.pago && (
                  <p className="text-red-500 text-sm font-body text-center">⚠️ {errores.pago}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPaso(2)}
                    className="flex-1 py-3.5 rounded-xl border border-corteza-200 text-corteza-600 font-body font-medium hover:bg-corteza-50 transition-colors">
                    ← Atrás
                  </button>
                  <button onClick={siguiente}
                    className="flex-1 py-3.5 rounded-xl bg-queso-600 hover:bg-queso-700 text-white font-body font-bold transition-all hover:shadow-lg">
                    Ver instrucciones →
                  </button>
                </div>
              </div>
            )}

            {/* ══ PASO 4: INSTRUCCIONES DE PAGO + COMPROBANTE ══ */}
            {paso === 4 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-display font-bold text-corteza-800 text-lg">
                  Realiza el pago y sube el comprobante
                </h3>

                {/* ── NEQUI ── */}
                {formaPago === 'nequi' && (
                  <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📱</span>
                      <p className="font-body font-bold text-pink-700 text-base">Pago con Nequi</p>
                    </div>

                    <div className="space-y-2 mb-4 font-body text-sm">
                      <div className="flex justify-between py-2 border-b border-pink-100">
                        <span className="text-corteza-500">Número Nequi</span>
                        <span className="font-bold text-corteza-800 text-base tracking-wider">
                          {DATOS_PAGO.nequi.numero}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-corteza-500">A nombre de</span>
                        <span className="font-medium text-corteza-800">{DATOS_PAGO.nequi.nombre}</span>
                      </div>
                    </div>

                    {/* Link de pago Nequi */}
                    <a
                      href={DATOS_PAGO.nequi.linkPago}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-body font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                    >
                      🔗 Abrir link de pago Nequi
                    </a>

                    <p className="text-xs text-pink-600 text-center mt-3 font-body">
                      O transfiere directamente desde tu app Nequi al número de arriba
                    </p>
                  </div>
                )}

                {/* ── BANCOLOMBIA ── */}
                {formaPago === 'bancolombia' && (
                  <div className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏦</span>
                      <p className="font-body font-bold text-yellow-700 text-base">Datos Bancolombia</p>
                    </div>

                    <div className="space-y-0 font-body text-sm">
                      {[
                        ['Banco', DATOS_PAGO.bancolombia.banco],
                        ['Tipo de cuenta', DATOS_PAGO.bancolombia.tipoCuenta],
                        ['Número de cuenta', DATOS_PAGO.bancolombia.numeroCuenta],
                        ['Titular', DATOS_PAGO.bancolombia.titular],
                        ['NIT / Cédula', DATOS_PAGO.bancolombia.nit],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between py-2 border-b border-yellow-100 last:border-0">
                          <span className="text-corteza-500">{label}</span>
                          <span className="font-bold text-corteza-800">{val}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-yellow-700 text-center mt-3 font-body">
                      Transfiere desde tu app Bancolombia o desde cualquier banco
                    </p>
                  </div>
                )}

                {/* ── SUBIR COMPROBANTE ── */}
                <div>
                  <p className="font-body text-sm font-medium text-corteza-600 mb-2">
                    📎 Adjunta el comprobante de pago *
                  </p>

                  {comprobantePreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-300">
                      <img src={comprobantePreview} alt="Comprobante" className="w-full max-h-48 object-contain bg-gray-50" />
                      <button
                        onClick={() => { setComprobante(null); setComprobantePreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="bg-green-50 py-2 text-center">
                        <p className="text-green-700 text-xs font-body font-medium">✓ Comprobante listo</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className={`w-full py-8 rounded-xl border-2 border-dashed transition-all font-body text-sm flex flex-col items-center gap-2 hover:bg-queso-50 ${
                        errores.comprobante ? 'border-red-400' : 'border-corteza-200 hover:border-queso-400'
                      }`}
                    >
                      <span className="text-3xl">📸</span>
                      <span className="font-medium text-corteza-600">Toca para subir la foto</span>
                      <span className="text-corteza-400 text-xs">PNG, JPG o PDF — máx. 5MB</span>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onArchivo}
                    className="hidden"
                  />
                  {errores.comprobante && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errores.comprobante}</p>
                  )}
                </div>

                {estado === 'error' && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setPaso(3)}
                    className="flex-1 py-3.5 rounded-xl border border-corteza-200 text-corteza-600 font-body font-medium hover:bg-corteza-50 transition-colors">
                    ← Atrás
                  </button>
                  <button
                    onClick={enviar}
                    disabled={enviando}
                    className="flex-1 py-3.5 rounded-xl bg-queso-600 hover:bg-queso-700 disabled:bg-queso-300 text-white font-body font-bold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : '🧀 Confirmar pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;