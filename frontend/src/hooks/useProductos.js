import { useState, useEffect, useCallback } from 'react';
import { obtenerProductos } from '../services/api';

/**
 * Hook personalizado para cargar y filtrar el menú de productos.
 * Maneja estados de carga, error y filtrado por categoría.
 */
export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await obtenerProductos(
        categoriaActiva === 'todos' ? null : categoriaActiva
      );
      setProductos(data);
    } catch (err) {
      setError(err.message || 'Error cargando el menú. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, [categoriaActiva]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const productosFiltrados = productos;

  const categorias = [
    { id: 'todos', label: 'Todos', emoji: '🧀' },
    { id: 'frescos', label: 'Frescos', emoji: '🥛' },
    { id: 'madurados', label: 'Madurados', emoji: '⏳' },
    { id: 'combos', label: 'Tablas & Combos', emoji: '🍽️' },
    { id: 'especiales', label: 'Especiales', emoji: '⭐' },
  ];

  return {
    productos: productosFiltrados,
    cargando,
    error,
    categoriaActiva,
    setCategoriaActiva,
    recargar: cargarProductos,
    categorias,
  };
};
