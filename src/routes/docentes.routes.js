const { Router } = require('express');
const {
  registrarDocente,
  obtenerDocentes,
  obtenerDocentePorId,
  obtenerDocentePorUID,
  asignarUID,
  actualizarEstadoDocente
} = require('../controllers/docentes.controller');

const router = Router();

// Registrar nuevo docente
router.post('/', registrarDocente);

// Obtener todos los docentes (con filtros opcionales: ?jornada=Matutina&estado=Activo)
router.get('/', obtenerDocentes);

// Obtener docente por ID
router.get('/:id', obtenerDocentePorId);

// Obtener docente por UID de tarjeta
router.get('/uid/:uid', obtenerDocentePorUID);

// Asignar UID de tarjeta a docente
router.put('/:id/uid', asignarUID);

// Actualizar estado del docente
router.put('/:id/estado', actualizarEstadoDocente);

module.exports = router;
