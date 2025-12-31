const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    getIncomeByDay,
    getIncomeByMonth,
    getIncomeByType,
    getStudentsByType,
    getPendingPayments,
    getTotalMoraEndpoint,
    getIncomeByPaymentMethod,
    getIngresosDia,
    getIngresosPorRango,
    getIngresosPorMes,
    getIngresosHistoricos,
    getIngresosPorTipoPago,
    getIngresosPorMetodoPago,
    getTotalPendiente,
    getEstudiantesConPendientes,
    getTopDeudores,
    getTotalMora,
    getEstadisticasEstudiantes,
    getEstadisticasCursos,
    getResumenDashboard,
    getDetailedReport
} = require('../controllers/dashboard.controller');

// ==================== NUEVO DASHBOARD ====================
router.get('/', getDashboardData);
router.get('/income-by-day', getIncomeByDay);
router.get('/income-by-month', getIncomeByMonth);
router.get('/income-by-type', getIncomeByType);
router.get('/students-by-type', getStudentsByType);
router.get('/pending-payments', getPendingPayments);
router.get('/total-mora', getTotalMoraEndpoint);
router.get('/income-by-payment-method', getIncomeByPaymentMethod);

// ==================== REPORTES ====================
router.get('/detailed-report', getDetailedReport);

// ==================== RESUMEN GENERAL ====================
router.get('/resumen', getResumenDashboard);

// ==================== INGRESOS ====================
router.get('/ingresos/dia', getIngresosDia);
router.get('/ingresos/rango', getIngresosPorRango);
router.get('/ingresos/mes', getIngresosPorMes);
router.get('/ingresos/historico', getIngresosHistoricos);
router.get('/ingresos/tipo-pago', getIngresosPorTipoPago);
router.get('/ingresos/metodo-pago', getIngresosPorMetodoPago);

// ==================== PENDIENTES ====================
router.get('/pendientes/total', getTotalPendiente);
router.get('/pendientes/estudiantes', getEstudiantesConPendientes);
router.get('/pendientes/top-deudores', getTopDeudores);
router.get('/pendientes/total-mora-old', getTotalMora);

// ==================== ESTUDIANTES ====================
router.get('/estudiantes/estadisticas', getEstadisticasEstudiantes);

// ==================== CURSOS ====================
router.get('/cursos/estadisticas', getEstadisticasCursos);

module.exports = router;
