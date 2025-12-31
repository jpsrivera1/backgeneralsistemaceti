const express = require('express');
const router = express.Router();
const {
    obtenerCategorias,
    obtenerCategoriaEstudiante,
    obtenerTallasEstudiante,
    guardarTallas,
    buscarEstudiantes,
    eliminarTalla,
    getUniformReports,
    exportUniformReportExcel,
    obtenerReporteInventarioTallas
} = require('../controllers/uniformes.controller');

// GET - Buscar estudiantes por nombre
router.get('/buscar', buscarEstudiantes);

// GET - Obtener todas las categorías con items
router.get('/categorias', obtenerCategorias);

// GET - Obtener categoría según nivel del estudiante
router.get('/categorias/estudiante/:studentId', obtenerCategoriaEstudiante);

// GET - Obtener tallas registradas de un estudiante
router.get('/tallas/:studentId', obtenerTallasEstudiante);

// POST - Guardar/actualizar tallas de un estudiante
router.post('/tallas/:studentId', guardarTallas);

// DELETE - Eliminar una talla específica
router.delete('/tallas/:id', eliminarTalla);

// ==================== REPORTES ====================
// GET - Obtener reportes de uniformes con filtros
router.get('/reports', getUniformReports);

// GET - Exportar reporte a Excel
router.get('/export-excel', exportUniformReportExcel);

// GET - Obtener reporte de inventario de tallas por categoría
router.get('/inventario-tallas', obtenerReporteInventarioTallas);

module.exports = router;
