const { Router } = require('express');
const {
    obtenerCursosExtra,
    obtenerEstudiantesCursos,
    buscarEstudiantesCursos,
    obtenerMeses,
    obtenerPagosCurso,
    verificarMesPagadoCurso,
    registrarPagoCurso,
    obtenerResumenPagosCursos
} = require('../controllers/cursos.controller');

const router = Router();

// Rutas para cursos extra
router.get('/cursos-extra', obtenerCursosExtra);

// Rutas para estudiantes de cursos
router.get('/estudiantes-cursos', obtenerEstudiantesCursos);
router.get('/estudiantes-cursos/buscar', buscarEstudiantesCursos);

// Rutas para meses
router.get('/meses', obtenerMeses);

// Rutas para pagos de cursos
router.get('/pagos-curso/:estudianteId', obtenerPagosCurso);
router.get('/pagos-curso/verificar/:estudianteId/:mesId', verificarMesPagadoCurso);
router.post('/pagos-curso', registrarPagoCurso);
router.get('/pagos-curso/resumen/:estudianteId', obtenerResumenPagosCursos);

module.exports = router;
