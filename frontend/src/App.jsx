import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Menu from './components/sections/Menu';
import Nosotros from './components/sections/Nosotros';
import Contacto from './components/sections/Contacto';

/**
 * Componente raíz de la aplicación.
 * Maneja el estado global del producto preseleccionado para el formulario.
 */
function App() {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const handlePedir = (producto) => {
    setProductoSeleccionado(producto);
    // Scroll suave al formulario de contacto
    setTimeout(() => {
      document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen font-body">
      <Navbar />

      <main>
        <Hero />
        <Menu onPedir={handlePedir} />
        <Nosotros />
        <Contacto
          productoPreseleccionado={productoSeleccionado}
          onLimpiarProducto={() => setProductoSeleccionado(null)}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
