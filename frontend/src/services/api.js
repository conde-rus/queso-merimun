/**
 * Servicio de API — conecta el frontend con el backend Express.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
};

// ── Productos ────────────────────────────────────────────
export const obtenerProductos = (categoria = null) => {
  const params = categoria ? `?categoria=${categoria}` : '';
  return apiFetch(`/productos${params}`);
};

export const obtenerProducto = (id) => apiFetch(`/productos/${id}`);

// ── Pedidos ──────────────────────────────────────────────

/**
 * Envía el pedido completo con comprobante de pago.
 * Usa FormData (multipart) para poder adjuntar la imagen.
 *
 * @param {FormData} formData - Todos los campos + archivo "comprobante"
 */
export const enviarPedidoConPago = (formData) =>
  apiFetch('/pedidos', {
    method: 'POST',
    // NO pongas Content-Type — el browser lo pone automáticamente con el boundary correcto
    body: formData,
  });