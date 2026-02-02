# Backend - Sistema de Control Académico CETI

API REST para el sistema de control académico del Centro Educativo Tecnológico Innova.

## 🚀 Despliegue en Render

**URL de Producción:** https://backgeneralsistemaceti.onrender.com

## 📋 Características

- Gestión de estudiantes y docentes
- Registro de asistencias con NFC
- Sistema de reportes y estadísticas
- Gestión de pagos y uniformes
- Dashboard administrativo
- Autenticación y autorización

## 🛠️ Tecnologías

- Node.js + Express
- Supabase (PostgreSQL)
- Twilio WhatsApp API
- JWT para autenticación

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
JWT_SECRET=tu_jwt_secret
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 📦 Instalación

```bash
npm install
```

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── controllers/      # Controladores de rutas
├── routes/          # Definición de rutas
├── config/          # Configuración (Supabase, etc.)
└── utils/           # Utilidades y helpers
```

## 🔗 Endpoints Principales

- `/api/auth` - Autenticación
- `/api/estudiantes` - Gestión de estudiantes
- `/api/docentes` - Gestión de docentes
- `/api/asistencias` - Registro de asistencias
- `/api/reportes` - Reportes y estadísticas
- `/api/pagos` - Gestión de pagos
- `/api/uniformes` - Gestión de uniformes

## 🔒 Seguridad

- CORS configurado para dominios específicos
- Autenticación JWT
- Validación de datos de entrada
- Manejo seguro de credenciales

## 📄 Licencia

© 2026 Centro Educativo Tecnológico Innova
