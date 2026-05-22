import { useState } from 'react';

/**
 * Tarjeta individual de producto del menú.
 * Muestra imagen, nombre, descripción, precio y CTA.
 */
const ProductCard = ({ producto, onPedir }) => {
  const [imgError, setImgError] = useState(false);
  const [hovering, setHovering] = useState(false);

  const {
    nombre,
    descripcion,
    precio,
    unidad = 'por kg',
    imagen,
    destacado,
    etiquetas = [],
  } = producto;

  const precioFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);

  // Emoji fallback por categoría
  const emojisFallback = ['🧀', '🥛', '🍽️', '⭐'];
  const emojiFallback = emojisFallback[Math.floor(Math.random() * emojisFallback.length)];

  return (
    <article
      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${
        hovering
          ? 'shadow-xl -translate-y-1 border-queso-300'
          : 'shadow-sm border-corteza-100'
      } ${destacado ? 'ring-2 ring-queso-400 ring-offset-1' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Badge destacado */}
      {destacado && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-queso-500 text-white text-xs font-body font-bold flex items-center gap-1">
          ⭐ Destacado
        </div>
      )}

      {/* Imagen */}
      <div className="relative h-52 bg-gradient-to-br from-crema-100 to-queso-100 overflow-hidden">
        {imagen && !imgError ? (
          <img
            src={imagen}
            alt={nombre}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              hovering ? 'scale-105' : 'scale-100'
            }`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-60 animate-float">🧀</span>
          </div>
        )}

        {/* Overlay sutil al hacer hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-corteza-900/20 to-transparent transition-opacity duration-300 ${
            hovering ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Etiquetas */}
        {etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {etiquetas.slice(0, 3).map((etiqueta) => (
              <span
                key={etiqueta}
                className="px-2 py-0.5 rounded-full bg-queso-100 text-queso-800 text-xs font-body"
              >
                {etiqueta}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-display font-bold text-corteza-800 text-lg leading-tight mb-2">
          {nombre}
        </h3>

        <p className="font-body text-corteza-500 text-sm leading-relaxed line-clamp-2 mb-4">
          {descripcion}
        </p>

        {/* Precio + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-queso-700 text-xl">
              {precioFormateado}
            </span>
            <span className="font-body text-corteza-400 text-xs ml-1">{unidad}</span>
          </div>

          <button
            onClick={() => onPedir(producto)}
            className="px-4 py-2 rounded-full bg-queso-600 hover:bg-queso-700 text-white text-sm font-body font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0"
          >
            Pedir →
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
