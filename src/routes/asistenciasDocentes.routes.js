const { Router } = require('express');
const {
  registrarAsistenciaDocente,
  obtenerAsistenciasDocentes,
  obtenerReporteDocente
} = require('../controllers/asistenciasDocentes.controller');

const router = Router();

// Registrar asistencia de docente
router.post('/marcar', registrarAsistenciaDocente);

// Obtener asistencias de docentes (por fecha y opcionalmente por jornada)
router.get('/', obtenerAsistenciasDocentes);

// Obtener reporte de un docente específico
router.get('/docente/:id', obtenerReporteDocente);

module.exports = router;
