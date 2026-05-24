import { useProductos } from '../../hooks/useProductos';
import ProductCard from '../ui/ProductCard';

const Menu = ({ onPedir }) => {
  const { productos, cargando, error, categoriaActiva, setCategoriaActiva, categorias, recargar } =
    useProductos();

  return (
    <section
      id="menu"
      className="py-20"
      style={{
        position: 'relative',
        backgroundImage: "url('/cheese-pattern.jpg')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
      }}
    >
      {/* Capa de color encima del fondo para suavizarlo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 248, 230, 0.82)',
          zIndex: 0,
        }}
      />

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header de sección */}
        <div className="text-center mb-12">
          <span className="font-body text-queso-600 text-sm font-medium tracking-widest uppercase">
            — Nuestro Catálogo —
          </span>
          <h2
            className="font-display font-bold text-corteza-800 mt-2 mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Menú de Quesos
          </h2>
          <p className="font-body text-corteza-500 max-w-xl mx-auto leading-relaxed">
            Desde quesos frescos hasta madurados de larga curación. Todos elaborados con
            leche de la más alta calidad y técnicas artesanales tradicionales.
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                categoriaActiva === cat.id
                  ? 'bg-queso-600 text-white shadow-md'
                  : 'bg-white text-corteza-600 border border-corteza-200 hover:border-queso-400 hover:text-queso-700'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Estado de carga */}
        {cargando && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-queso-200 border-t-queso-600 rounded-full animate-spin mb-4" />
            <p className="font-body text-corteza-400">Cargando el menú...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && !cargando && (
          <div className="text-center py-16 max-w-md mx-auto">
            <p className="text-4xl mb-4">😕</p>
            <p className="font-body text-corteza-600 mb-6">{error}</p>
            <button
              onClick={recargar}
              className="px-6 py-2.5 rounded-full bg-queso-600 text-white font-body font-medium hover:bg-queso-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de productos */}
        {!cargando && !error && productos.length > 0 && (
          <>
            <p className="font-body text-corteza-400 text-sm text-center mb-8">
              {productos.length} producto{productos.length !== 1 ? 's' : ''} disponible{productos.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} onPedir={onPedir} />
              ))}
            </div>
          </>
        )}

        {/* Sin resultados */}
        {!cargando && !error && productos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🧀</p>
            <p className="font-display text-corteza-600 text-xl">
              No hay productos en esta categoría
            </p>
            <button
              onClick={() => setCategoriaActiva('todos')}
              className="mt-4 font-body text-queso-600 underline hover:text-queso-800"
            >
              Ver todos los quesos
            </button>
          </div>
        )}

        {/* Nota de pedido mínimo */}
        {!cargando && (
          <div className="mt-12 text-center p-6 rounded-2xl bg-gradient-to-r from-queso-100 to-crema-200 border border-queso-200">
            <p className="font-body text-corteza-700 text-sm">
              💡 <strong>¿No ves lo que buscas?</strong> Escríbenos — manejamos pedidos especiales,
              maridajes y tablas personalizadas para eventos.{' '}
              <button
                onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-queso-700 font-semibold underline hover:text-queso-900"
              >
                Contáctanos →
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;