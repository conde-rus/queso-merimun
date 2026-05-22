# 🧀 La Quesería — Aplicación Web Profesional

Plataforma web completa para empresa de quesos artesanales con catálogo interactivo, sistema de pedidos y backend en Node.js + Firebase.

---

## 📁 Estructura del Proyecto

```
queseria-app/
├── backend/                          # API REST con Express.js
│   ├── scripts/
│   │   └── seed.js                   # 🌱 Poblar Firebase con productos de ejemplo
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js           # Inicialización Firebase Admin SDK
│   │   ├── middleware/
│   │   │   └── seguridad.js          # Rate limiting + validación + error handler
│   │   ├── routes/
│   │   │   ├── productos.js          # GET /api/productos y GET /api/productos/:id
│   │   │   └── pedidos.js            # POST /api/pedidos y GET /api/pedidos
│   │   ├── services/
│   │   │   └── emailService.js       # Nodemailer — correos automáticos
│   │   └── index.js                  # 🚀 Servidor Express principal
│   ├── .env.example                  # Variables de entorno (copia a .env)
│   └── package.json
│
└── frontend/                         # React + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx         # Barra de navegación fija con scroll
    │   │   │   └── Footer.jsx         # Pie de página
    │   │   ├── sections/
    │   │   │   ├── Hero.jsx           # Sección de bienvenida principal
    │   │   │   ├── Menu.jsx           # Catálogo con filtros por categoría
    │   │   │   ├── Nosotros.jsx       # Historia y valores de la empresa
    │   │   │   └── Contacto.jsx       # Formulario de pedidos con validación
    │   │   └── ui/
    │   │       └── ProductCard.jsx    # Tarjeta individual de producto
    │   ├── hooks/
    │   │   └── useProductos.js        # Hook para cargar y filtrar productos
    │   ├── services/
    │   │   └── api.js                 # Capa de comunicación con el backend
    │   ├── App.jsx                    # Componente raíz
    │   ├── main.jsx                   # Punto de entrada React
    │   └── index.css                  # Estilos globales + fuentes
    ├── .env.example
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Configuración y Arranque

### Prerrequisitos
- Node.js 18+
- Cuenta en [Firebase](https://console.firebase.google.com/)

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) → Nuevo proyecto
2. Habilita **Firestore Database** (modo producción o prueba)
3. Habilita **Storage**
4. Ve a **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**
5. Descarga el JSON con las credenciales

### 2. Configurar el Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de Firebase y correo
npm install
```

**Variables obligatorias en `.env`:**
```env
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
EMAIL_USER=ventas@tuqueseria.com
EMAIL_PASS=tu_contrasena_de_app_gmail
EMAIL_TO=ventas@tuqueseria.com
```

### 3. Poblar la base de datos (seed)

```bash
cd backend
node scripts/seed.js
```

Esto crea 11 productos de ejemplo en Firestore. ✅

### 4. Arrancar el backend

```bash
cd backend
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

El servidor corre en `http://localhost:4000`

### 5. Configurar el Frontend

```bash
cd frontend
cp .env.example .env   # Opcional — el proxy de Vite ya conecta al backend
npm install
npm run dev
```

La app corre en `http://localhost:5173` 🎉

---

## 🌐 Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/productos` | Lista todos los productos disponibles |
| `GET` | `/api/productos?categoria=frescos` | Filtra por categoría |
| `GET` | `/api/productos/:id` | Obtiene un producto por ID |
| `POST` | `/api/pedidos` | Envía formulario y guarda en Firestore |
| `GET` | `/api/pedidos` | Lista pedidos (proteger con auth en producción) |

### Ejemplo POST /api/pedidos

```json
{
  "nombre": "María García",
  "correo": "maria@gmail.com",
  "telefono": "+57 300 123 4567",
  "tipoPedido": "pedido",
  "mensaje": "Quiero 2kg de queso campesino y una tabla gourmet."
}
```

---

## 📋 Estructura de Firestore

### Colección `productos`
```json
{
  "nombre": "Queso Campesino Fresco",
  "descripcion": "Queso blanco suave y húmedo...",
  "precio": 18000,
  "unidad": "por kg",
  "categoria": "frescos",
  "imagen": "https://storage.googleapis.com/...",
  "disponible": true,
  "destacado": true,
  "orden": 1,
  "etiquetas": ["artesanal", "sin preservantes"]
}
```

### Colección `pedidos`
```json
{
  "nombre": "María García",
  "correo": "maria@gmail.com",
  "telefono": "+57 300 123 4567",
  "mensaje": "Quiero 2kg de queso...",
  "tipoPedido": "pedido",
  "estado": "pendiente",
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "origen": "https://laqueseria.com"
}
```

---

## 📸 Subir fotos a Firebase Storage

1. Ve a Firebase Console → Storage
2. Sube las fotos de los quesos
3. Copia la URL pública de cada foto
4. Actualiza el campo `imagen` de cada producto en Firestore

---

## 🔐 Seguridad implementada

- ✅ **Helmet** — Headers HTTP de seguridad
- ✅ **CORS** — Solo acepta requests del frontend
- ✅ **Rate Limiting** — 100 req/15min general; 5 pedidos/hora en el formulario
- ✅ **express-validator** — Validación y sanitización de inputs
- ✅ **Payload limit** — Máximo 10KB por request
- ✅ **Variables de entorno** — Credenciales nunca en el código

---

## 🚢 Despliegue en Producción

| Servicio | Recomendado para |
|----------|-----------------|
| **Railway** / **Render** | Backend Express |
| **Vercel** / **Netlify** | Frontend React |
| **Firebase Hosting** | Alternativa para el frontend |

Recuerda actualizar `FRONTEND_URL` en el backend y `VITE_API_URL` en el frontend con las URLs de producción.

---

## 📧 Configuración de Correo (Gmail)

1. Activa la verificación en 2 pasos en tu cuenta de Gmail
2. Ve a [Contraseñas de aplicación](https://myaccount.google.com/apppasswords)
3. Genera una contraseña para "Correo" en el dispositivo "Otro"
4. Úsala en `EMAIL_PASS` del `.env`

---

## 🛣️ Próximos pasos sugeridos

- [ ] Panel de administración para gestionar productos y pedidos
- [ ] Autenticación Firebase para el panel admin
- [ ] Integración con WhatsApp Business API
- [ ] Carrito de compras con cálculo de totales
- [ ] Pasarela de pagos (Wompi, PayU)
- [ ] Sistema de reseñas de productos

---

*Hecho con 🧀 en Medellín, Colombia*
