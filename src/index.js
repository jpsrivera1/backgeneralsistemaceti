const express = require('express');
const cors = require('cors');
require('dotenv').config();

const estudiantesRoutes = require('./routes/estudiantes.routes');
const authRoutes = require('./routes/auth.routes');
const pagosRoutes = require('./routes/pagos.routes');
const uniformesRoutes = require('./routes/uniformes.routes');
const cursosRoutes = require('./routes/cursos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
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
            dashboard: '/api/dashboard'
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

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 API de Estudiantes: http://localhost:${PORT}/api/estudiantes`);
});
