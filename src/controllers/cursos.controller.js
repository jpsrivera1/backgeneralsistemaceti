const supabase = require('../config/supabase');

// Calcular mora (solo de febrero a octubre, si el día actual es mayor a 5)
const calcularMora = (mesId = 0) => {
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate();
    
    // El mes_id corresponde directamente al número del mes (1=Enero, 2=Febrero, etc.)
    const mesPagar = parseInt(mesId) || 0;
    
    // Solo aplicar mora de febrero (2) a octubre (10) y después del día 5
    if (mesPagar >= 2 && mesPagar <= 10 && diaActual > 5) {
        return 30.00;
    }
    return 0.00;
};

// ==================== CURSOS EXTRA ====================

// Obtener todos los cursos extra
const obtenerCursosExtra = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('extra_courses')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener cursos extra' });
    }
};

// Obtener estudiantes de cursos (tipo_estudiante = 'CURSO')
const obtenerEstudiantesCursos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                extra_courses (
                    id,
                    nombre,
                    descripcion
                )
            `)
            .eq('tipo_estudiante', 'CURSO')
            .order('nombre', { ascending: true });

        if (error) throw error;

        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estudiantes de cursos' });
    }
};

// Buscar estudiantes de cursos por nombre
const buscarEstudiantesCursos = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre || nombre.length < 2) {
            return res.status(200).json([]);
        }

        const { data, error } = await supabase
            .from('students')
            .select(`
                id, 
                nombre, 
                apellidos,
                jornada,
                modalidad,
                curso_extra_id,
                extra_courses (
                    id,
                    nombre
                )
            `)
            .eq('tipo_estudiante', 'CURSO')
            .or(`nombre.ilike.%${nombre}%,apellidos.ilike.%${nombre}%`)
            .order('apellidos', { ascending: true })
            .limit(10);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar estudiantes' });
    }
};

// ==================== PAGOS DE CURSOS ====================

// Obtener meses disponibles
const obtenerMeses = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('months')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener meses' });
    }
};

// Obtener pagos de un estudiante
const obtenerPagosCurso = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        const { data, error } = await supabase
            .from('course_payments')
            .select(`
                *,
                months (
                    id,
                    name
                )
            `)
            .eq('student_id', estudianteId)
            .order('month_id', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pagos del curso' });
    }
};

// Verificar si un mes ya está pagado
const verificarMesPagadoCurso = async (req, res) => {
    try {
        const { estudianteId, mesId } = req.params;

        const { data, error } = await supabase
            .from('course_payments')
            .select('*')
            .eq('student_id', estudianteId)
            .eq('month_id', mesId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json({ 
            pagado: !!data, 
            pago: data 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al verificar mes' });
    }
};

// Registrar pago de curso
const registrarPagoCurso = async (req, res) => {
    try {
        const { estudiante_id, mes_id, monto, payment_method_id } = req.body;
        
        // Recalcular mora en el backend para asegurar consistencia
        const moraCalculada = calcularMora(mes_id);

        // Obtener datos del estudiante con su curso
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select(`
                *,
                extra_courses (
                    id,
                    nombre
                )
            `)
            .eq('id', estudiante_id)
            .single();

        if (errorEst) throw errorEst;

        if (!estudiante.curso_extra_id) {
            return res.status(400).json({ error: 'El estudiante no tiene un curso asignado' });
        }

        // Obtener nombre del mes
        const { data: mesData } = await supabase
            .from('months')
            .select('name')
            .eq('id', mes_id)
            .single();

        // Obtener nombre del método de pago
        let metodo_pago_nombre = 'N/A';
        if (payment_method_id) {
            const { data: metodoPago } = await supabase
                .from('payment_methods')
                .select('name')
                .eq('id', payment_method_id)
                .single();
            if (metodoPago) metodo_pago_nombre = metodoPago.name;
        }

        // Verificar si ya existe pago para ese mes
        const { data: existente } = await supabase
            .from('course_payments')
            .select('id')
            .eq('student_id', estudiante_id)
            .eq('month_id', mes_id)
            .single();

        if (existente) {
            return res.status(400).json({ error: 'Este mes ya fue pagado' });
        }

        // Calcular total con mora
        const montoTotal = parseFloat(monto) + moraCalculada;

        // Insertar pago
        const { data, error } = await supabase
            .from('course_payments')
            .insert({
                student_id: estudiante_id,
                course_id: estudiante.curso_extra_id,
                month: mesData?.name || '',
                month_id: mes_id,
                amount: montoTotal,
                status: 'Pagado',
                payment_method_id: payment_method_id || null
            })
            .select()
            .single();

        if (error) throw error;

        // Generar número de recibo
        const anioActual = new Date().getFullYear();
        const numeroRecibo = `CUR-${anioActual}-${String(Date.now()).slice(-6)}`;

        res.status(201).json({
            ...data,
            numero_recibo: numeroRecibo,
            monto: monto,
            mora: moraCalculada,
            metodo_pago: metodo_pago_nombre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar pago' });
    }
};

// Obtener resumen de pagos de un estudiante
const obtenerResumenPagosCursos = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        // Obtener pagos del estudiante
        const { data: pagos, error } = await supabase
            .from('course_payments')
            .select('amount')
            .eq('student_id', estudianteId);

        if (error) throw error;

        // Calcular resumen
        const mesesPagados = pagos.length;
        const totalPagado = pagos.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const mesesPendientes = 10 - mesesPagados; // 10 meses en el año escolar

        res.status(200).json({
            meses_pagados: mesesPagados,
            meses_pendientes: mesesPendientes,
            total_pagado: totalPagado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen de pagos' });
    }
};

module.exports = {
    obtenerCursosExtra,
    obtenerEstudiantesCursos,
    buscarEstudiantesCursos,
    obtenerMeses,
    obtenerPagosCurso,
    verificarMesPagadoCurso,
    registrarPagoCurso,
    obtenerResumenPagosCursos
};
