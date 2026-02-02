const express = require('express');
const router = express.Router();
const {
  recibirUIDDetectado,
  obtenerUltimoUID,
  asignarUID,
  obtenerEstudiantePorUID,
  registrarAsistencia,
  obtenerAsistencias,
  obtenerHistorialEstudiante
} = require('../controllers/asistencias.controller');

// Endpoints para comunicación con el lector NFC local
router.post('/uid-detectado', recibirUIDDetectado);
router.get('/ultimo-uid', obtenerUltimoUID);

// Asignar UID a estudiante
router.put('/estudiante/:studentId/uid', asignarUID);

// Obtener estudiante por UID
router.get('/uid/:uid', obtenerEstudiantePorUID);

// Registrar asistencia
router.post('/marcar', registrarAsistencia);

// Obtener asistencias del día o por fecha
router.get('/', obtenerAsistencias);

// Obtener historial de un estudiante
router.get('/estudiante/:studentId/historial', obtenerHistorialEstudiante);

module.exports = router;
