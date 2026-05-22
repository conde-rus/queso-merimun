const Nosotros = () => {
  const valores = [
    {
      icon: '🥛',
      titulo: 'Leche de calidad',
      desc: 'Solo trabajamos con leche fresca de fincas colombianas certificadas.',
    },
    {
      icon: '🤲',
      titulo: 'Técnica artesanal',
      desc: 'Cada queso se elabora a mano siguiendo recetas transmitidas por generaciones.',
    },
    {
      icon: '🌿',
      titulo: 'Sin aditivos',
      desc: 'Ingredientes naturales, sin conservantes artificiales ni colorantes.',
    },
    {
      icon: '📦',
      titulo: 'Entrega a domicilio',
      desc: 'Llegamos a tu puerta con el queso fresco del día, en Medellín y alrededores.',
    },
  ];

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Ilustración / Visual */}
          <div className="relative">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #020202, #000000, #7d7d7d)',
                aspectRatio: '4/3',
              }}
            >
                     {/* Logo centrado, grande y bien ajustado */}
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-10">
                <img
                  src="/logo1.png"
                  alt="La Quesería de Miramu"
                  className="w-full max-w-xs object-contain"
                  style={{ maxHeight: '180px' }}
                />
                <p
                  className="font-display font-bold text-2xl"
                  style={{ color: '#C8956C' }}   /* bronce/dorado apagado */
                >
                  Desde 1987
                </p>
                <p
                  className="font-body text-base"
                  style={{ color: '#9E7B60' }}
                >
                  Haciendo quesos con amor
                </p>
              </div>
            </div>

            {/* Badge flotante */}
            <div className="absolute -bottom-5 -right-5 bg-corteza-800 text-white rounded-2xl px-6 py-4 shadow-xl">
              <p className="font-display font-bold text-3xl text-queso-300">37</p>
              <p className="font-body text-queso-200 text-xs uppercase tracking-wide">Años de experiencia</p>
            </div>
          </div>

          {/* Contenido */}
          <div>
            <span className="font-body text-queso-600 text-sm font-medium tracking-widest uppercase">
              — Nuestra Historia —
            </span>
            <h2
              className="font-display font-bold text-corteza-800 mt-2 mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
            >
              Tradición quesera de generación en generación
            </h2>
            <p className="font-body text-corteza-500 leading-relaxed mb-4">
             Una organización colombiana  comprometida  con el 
              bienestar, la seguridad  y el progreso  del sector de 
              lácteos. Somos  la mejor  opción para  
              quienes
              buscan  respaldo jurídico, estabilidad  laboral 
              y oportunidades  de crecimiento 
              dentro 
              sector   
              de lácteos, la construcción transporte de 
              alimentos.
            </p>
            <p className="font-body text-corteza-500 leading-relaxed mb-8">
            Nuestra base está firmemente anclada en principios 
            cristianos, guiándonos en cada decisión con 
            integridad y servicio. Nos esforzamos por brindar 
            soluciones efectivas que fortalezcan la confianza y la 
            tranquilidad de nuestros asociados. 

            </p>

            {/* Grid de valores */}
            <div className="grid grid-cols-2 gap-4">
              {valores.map((val) => (
                <div
                  key={val.titulo}
                  className="p-4 rounded-xl bg-queso-50 border border-queso-100 hover:border-queso-300 transition-colors"
                >
                  <p className="text-2xl mb-2">{val.icon}</p>
                  <p className="font-body font-bold text-corteza-700 text-sm mb-1">{val.titulo}</p>
                  <p className="font-body text-corteza-500 text-xs leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
