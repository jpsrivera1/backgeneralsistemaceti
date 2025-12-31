const express = require('express');
const router = express.Router();
const {
    buscarEstudiantes,
    obtenerPagosEstudiante,
    obtenerPago,
    guardarPago,
    obtenerResumenPagos,
    obtenerColegiaturas,
    verificarMesPagado,
    registrarColegiatura,
    obtenerInfoRecibo,
    obtenerMetodosPago,
    obtenerPagoGraduacion,
    guardarPagoGraduacion
} = require('../controllers/pagos.controller');

// Buscar estudiantes por nombre
router.get('/buscar', buscarEstudiantes);

// Obtener resumen de todos los pagos
router.get('/resumen', obtenerResumenPagos);

// Obtener métodos de pago
router.get('/metodos-pago', obtenerMetodosPago);

// ===== GRADUACIÓN =====
// Obtener pago de graduación
router.get('/graduacion/:studentId', obtenerPagoGraduacion);

// Registrar pago de graduación
router.post('/graduacion/:studentId', guardarPagoGraduacion);

// ===== COLEGIATURAS =====
// IMPORTANTE: Rutas más específicas primero

// Obtener info para recibo (debe ir ANTES de la ruta con :studentId)
router.get('/colegiaturas/recibo/:pagoId', obtenerInfoRecibo);

// Verificar si un mes está pagado
router.get('/colegiaturas/:studentId/mes/:mes', verificarMesPagado);

// Obtener historial de colegiaturas
router.get('/colegiaturas/:studentId', obtenerColegiaturas);

// Registrar pago de colegiatura
router.post('/colegiaturas/:studentId', registrarColegiatura);

// ===== PAGOS GENERALES =====
// Obtener todos los pagos de un estudiante
router.get('/estudiante/:studentId', obtenerPagosEstudiante);

// Obtener un pago específico
router.get('/estudiante/:studentId/:tipoPago', obtenerPago);

// Crear o actualizar un pago
router.post('/estudiante/:studentId/:tipoPago', guardarPago);

module.exports = router;
