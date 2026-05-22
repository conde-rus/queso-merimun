/**
 * Servicio de API.
 * Con Firebase Hosting + Functions, las rutas /api/*
 * se resuelven en el mismo dominio — no necesitas VITE_API_URL.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
};

export const obtenerProductos = (categoria = null) => {
  const params = categoria ? `?categoria=${categoria}` : '';
  return apiFetch(`/productos${params}`);
};

export const obtenerProducto = (id) => apiFetch(`/productos/${id}`);

export const enviarPedidoConPago = (formData) =>
  apiFetch('/pedidos', {
    method: 'POST',
    body: formData,
  });