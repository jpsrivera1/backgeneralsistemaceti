const express = require('express');
const router = express.Router();
const {
    obtenerEstudiantes,
    obtenerEstudiantePorId,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante
} = require('../controllers/estudiantes.controller');

// GET - Obtener todos los estudiantes
router.get('/', obtenerEstudiantes);

// GET - Obtener estudiante por ID
router.get('/:id', obtenerEstudiantePorId);

// POST - Crear nuevo estudiante
router.post('/', crearEstudiante);

// PUT - Actualizar estudiante
router.put('/:id', actualizarEstudiante);

// DELETE - Eliminar estudiante
router.delete('/:id', eliminarEstudiante);

module.exports = router;
