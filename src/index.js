const express = require('express');
const cors = require('cors');
require('dotenv').config();

const estudiantesRoutes = require('./routes/estudiantes.routes');
const authRoutes = require('./routes/auth.routes');
const pagosRoutes = require('./routes/pagos.routes');
const uniformesRoutes = require('./routes/uniformes.routes');
const cursosRoutes = require('./routes/cursos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const docentesRoutes = require('./routes/docentes.routes');
const asistenciasDocentesRoutes = require('./routes/asistenciasDocentes.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para desarrollo local y producción
const corsOptions = {
  origin: [
    // URLs de Producción
    'https://registrosceti.vercel.app', // Front de registro estudiantes
    'https://paneladminceti.vercel.app', // Panel admin
    'https://controlacademico.vercel.app', // Sistema NFC reportes académicos
    // URLs de Desarrollo Local
    'http://localhost:5173', // Front de registro estudiantes
    'http://localhost:5174', // Sistema NFC reportes académicos
    'http://localhost:4525', // Panel admin
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:4525'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: '🎓 API de Registro de Estudiantes',
        version: '1.0.0',
        endpoints: {
            estudiantes: '/api/estudiantes',
            auth: '/api/auth',
            pagos: '/api/pagos',
            uniformes: '/api/uniformes',
            cursos: '/api/cursos',
            dashboard: '/api/dashboard',
            asistencias: '/api/asistencias',
            docentes: '/api/docentes',
            reportes: '/api/reportes'
        }
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de estudiantes
app.use('/api/estudiantes', estudiantesRoutes);

// Rutas de pagos
app.use('/api/pagos', pagosRoutes);

// Rutas de uniformes
app.use('/api/uniformes', uniformesRoutes);

// Rutas de cursos extra
app.use('/api/cursos', cursosRoutes);

// Rutas del dashboard
app.use('/api/dashboard', dashboardRoutes);

// Rutas de asistencias
app.use('/api/asistencias', asistenciasRoutes);

// Rutas de docentes
app.use('/api/docentes', docentesRoutes);

// Rutas de asistencias de docentes
app.use('/api/asistencias-docentes', asistenciasDocentesRoutes);

// Rutas de reportes
app.use('/api/reportes', reportesRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 API de Estudiantes: http://localhost:${PORT}/api/estudiantes`);
});
