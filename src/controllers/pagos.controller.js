const supabase = require('../config/supabase');

// Tipos de pago disponibles
const TIPOS_PAGO = {
    inscripcion: 'pago_inscripcion',
    uniforme: 'pago_uniforme',
    libros_lectura: 'pago_libros_lectura',
    copias_anuales: 'pago_copias_anuales',
    libro_ingles: 'pago_libro_ingles',
    excursion: 'pago_excursion',
    especialidad: 'pago_especialidad'
};

// Nombres legibles de tipos de pago
const NOMBRES_PAGO = {
    inscripcion: 'Inscripción',
    uniforme: 'Uniforme',
    libros_lectura: 'Libros de Lectura',
    copias_anuales: 'Copias Anuales',
    libro_ingles: 'Libro de Inglés',
    excursion: 'Excursión',
    especialidad: 'Especialidad'
};

// Grados que aplican para pago de graduación (todas las modalidades y jornadas)
const GRADOS_GRADUACION = [
    // Existentes
    '5to Baco', '5TO BACO', '6to PCB', '6TO PCB', 'Prepa', 'PREPA',
    // Diario Matutina
    '9no', '9NO',
    // Diario Vespertina
    '5to. BACH en Diseño', '5TO. BACH EN DISEÑO',
    '5to. BACH en Mecánica', '5TO. BACH EN MECÁNICA',
    '5to. BACH en Electricidad', '5TO. BACH EN ELECTRICIDAD',
    // Fin de Semana
    '3ro. Básico', '3RO. BÁSICO', '3ro Basico', '3RO BASICO',
    '2do. Año - Basico por Madurez', '2DO. AÑO - BASICO POR MADUREZ',
    '5to. BACO Comercial', '5TO. BACO COMERCIAL',
    '6to. PCB en Compu', '6TO. PCB EN COMPU',
    'BACH por Madurez', 'BACH POR MADUREZ'
];

// Obtener métodos de pago disponibles
const obtenerMetodosPago = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener métodos de pago' });
    }
};

// Buscar estudiantes por nombre
const buscarEstudiantes = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre || nombre.length < 2) {
            return res.status(400).json({ error: 'Ingrese al menos 2 caracteres para buscar' });
        }

        const { data, error } = await supabase
            .from('students')
            .select(`
                id, 
                nombre, 
                apellidos, 
                grado,
                jornada,
                modalidad,
                tipo_estudiante,
                curso_extra_id,
                extra_courses (
                    id,
                    nombre
                )
            `)
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

// Obtener todos los pagos de un estudiante
const obtenerPagosEstudiante = async (req, res) => {
    try {
        const { studentId } = req.params;

        const pagos = {};

        // Consultar cada tabla de pagos
        for (const [tipo, tabla] of Object.entries(TIPOS_PAGO)) {
            const { data, error } = await supabase
                .from(tabla)
                .select('*')
                .eq('student_id', studentId)
                .single();

            if (!error && data) {
                pagos[tipo] = data;
            } else {
                pagos[tipo] = null;
            }
        }

        res.status(200).json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

// Obtener un pago específico
const obtenerPago = async (req, res) => {
    try {
        const { studentId, tipoPago } = req.params;

        const tabla = TIPOS_PAGO[tipoPago];
        if (!tabla) {
            return res.status(400).json({ error: 'Tipo de pago no válido' });
        }

        const { data, error } = await supabase
            .from(tabla)
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json(data || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pago' });
    }
};

// Crear o actualizar un pago
const guardarPago = async (req, res) => {
    try {
        const { studentId, tipoPago } = req.params;
        const { monto_total, monto_abono, es_pago_pendiente, payment_method_id } = req.body;

        const tabla = TIPOS_PAGO[tipoPago];
        if (!tabla) {
            return res.status(400).json({ error: 'Tipo de pago no válido' });
        }

        // Obtener datos del estudiante
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (errorEst) throw errorEst;

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

        // Verificar si ya existe un pago
        const { data: existente } = await supabase
            .from(tabla)
            .select('*')
            .eq('student_id', studentId)
            .single();

        let resultado;
        let esNuevoPago = false;
        let montoAbonado = parseFloat(monto_abono || monto_total);
        let montoPendienteAnterior = 0;

        if (existente) {
            montoPendienteAnterior = parseFloat(existente.monto_pendiente) || 0;
            
            // Si es pago del pendiente, solo agregar al adelanto
            if (es_pago_pendiente && montoPendienteAnterior > 0) {
                // Pagar exactamente lo pendiente o lo que se abona
                const nuevoAdelanto = parseFloat(existente.monto_adelanto) + montoAbonado;
                
                const { data, error } = await supabase
                    .from(tabla)
                    .update({
                        monto_adelanto: nuevoAdelanto,
                        payment_method_id: payment_method_id || existente.payment_method_id,
                        fecha_actualizacion: new Date().toISOString()
                    })
                    .eq('student_id', studentId)
                    .select()
                    .single();

                if (error) throw error;
                resultado = data;
            } else {
                // Actualizar pago existente (cambiar monto total)
                const { data, error } = await supabase
                    .from(tabla)
                    .update({
                        monto_total: parseFloat(monto_total),
                        monto_adelanto: parseFloat(monto_abono || 0),
                        payment_method_id: payment_method_id || existente.payment_method_id,
                        fecha_actualizacion: new Date().toISOString()
                    })
                    .eq('student_id', studentId)
                    .select()
                    .single();

                if (error) throw error;
                resultado = data;
            }
        } else {
            esNuevoPago = true;
            // Crear nuevo pago
            const { data, error } = await supabase
                .from(tabla)
                .insert({
                    student_id: studentId,
                    monto_total: parseFloat(monto_total),
                    monto_adelanto: parseFloat(monto_abono || 0),
                    payment_method_id: payment_method_id || null
                })
                .select()
                .single();

            if (error) throw error;
            resultado = data;
        }

        // Generar número de recibo
        const anioActual = new Date().getFullYear();
        const tipoAbreviado = tipoPago.substring(0, 3).toUpperCase();
        const numeroRecibo = `${tipoAbreviado}-${anioActual}-${String(Date.now()).slice(-6)}`;

        // Determinar si está completamente pagado
        const estaCancelado = parseFloat(resultado.monto_pendiente) === 0;

        res.status(200).json({
            pago: resultado,
            estudiante,
            numeroRecibo,
            tipoPago: NOMBRES_PAGO[tipoPago],
            montoAbonado,
            montoPendienteAnterior,
            estaCancelado,
            esAbono: es_pago_pendiente || false,
            metodo_pago: metodo_pago_nombre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar pago' });
    }
};

// Obtener resumen de pagos (vista)
const obtenerResumenPagos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vista_pagos_estudiantes')
            .select('*')
            .order('estudiante', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen de pagos' });
    }
};

// ==================== COLEGIATURAS ====================

// Obtener historial de colegiaturas de un estudiante
const obtenerColegiaturas = async (req, res) => {
    try {
        const { studentId } = req.params;
        const anioActual = new Date().getFullYear();

        const { data, error } = await supabase
            .from('pago_colegiaturas')
            .select('*')
            .eq('student_id', studentId)
            .eq('anio', anioActual)
            .order('fecha_pago', { ascending: true });

        if (error) throw error;

        res.status(200).json(data || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener colegiaturas' });
    }
};

// Verificar si un mes ya está pagado
const verificarMesPagado = async (req, res) => {
    try {
        const { studentId, mes } = req.params;
        const anioActual = new Date().getFullYear();

        const { data, error } = await supabase
            .from('pago_colegiaturas')
            .select('*')
            .eq('student_id', studentId)
            .eq('mes', mes.toUpperCase())
            .eq('anio', anioActual)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json({ pagado: !!data, pago: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al verificar mes' });
    }
};

// Calcular mora (solo de febrero a octubre, si la fecha actual es posterior al día 5 del mes que se está pagando)
const calcularMora = (mesNombre = '') => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
    const anioActual = fechaActual.getFullYear();
    const diaActual = fechaActual.getDate();
    
    // Mapeo de nombres de mes a números
    const mesesMap = {
        'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4,
        'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
        'SEPTIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12
    };
    
    const mesPagar = mesesMap[mesNombre.toUpperCase()] || 0;
    
    // Solo aplicar mora de febrero (2) a octubre (10)
    if (mesPagar < 2 || mesPagar > 10) {
        return 0.00;
    }
    
    // Crear fecha de vencimiento: día 5 del mes que se está pagando
    const fechaVencimiento = new Date(anioActual, mesPagar - 1, 5);
    
    // Solo aplicar mora si la fecha actual es posterior a la fecha de vencimiento
    if (fechaActual > fechaVencimiento) {
        return 30.00;
    }
    
    return 0.00;
};

// Registrar pago de colegiatura
const registrarColegiatura = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { mes, monto_colegiatura, payment_method_id } = req.body;
        const anioActual = new Date().getFullYear();

        // Verificar si ya existe pago para ese mes
        const { data: existente } = await supabase
            .from('pago_colegiaturas')
            .select('id')
            .eq('student_id', studentId)
            .eq('mes', mes.toUpperCase())
            .eq('anio', anioActual)
            .single();

        if (existente) {
            return res.status(400).json({ error: 'Este mes ya fue pagado' });
        }

        // Obtener datos del estudiante
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (errorEst) throw errorEst;

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

        // Calcular mora según la lógica de negocio (solo febrero a octubre)
        const mora = calcularMora(mes);

        // Insertar pago con la mora calculada (total_pagado se calcula automáticamente en la BD)
        const { data, error } = await supabase
            .from('pago_colegiaturas')
            .insert({
                student_id: studentId,
                mes: mes.toUpperCase(),
                monto_colegiatura: parseFloat(monto_colegiatura),
                mora: mora,
                fecha_pago: new Date().toISOString().split('T')[0],
                payment_method_id: payment_method_id || null
            })
            .select()
            .single();

        if (error) throw error;

        // Generar número de boleto único
        const numeroBoleto = `COL-${anioActual}-${String(Date.now()).slice(-6)}`;

        res.status(201).json({
            pago: data,
            estudiante,
            numeroBoleto,
            mora: data.mora,
            total: data.total_pagado,
            metodo_pago: metodo_pago_nombre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar colegiatura' });
    }
};

// Obtener información para recibo
const obtenerInfoRecibo = async (req, res) => {
    try {
        const { pagoId } = req.params;

        const { data: pago, error: errorPago } = await supabase
            .from('pago_colegiaturas')
            .select('*')
            .eq('id', pagoId)
            .single();

        if (errorPago) throw errorPago;

        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('id', pago.student_id)
            .single();

        if (errorEst) throw errorEst;

        res.status(200).json({
            pago,
            estudiante,
            numeroBoleto: `COL-${pago.anio}-${String(new Date(pago.created_at).getTime()).slice(-6)}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener información del recibo' });
    }
};

// ==================== PAGOS DE GRADUACIÓN ====================

// Verificar si estudiante aplica para graduación (solo por grado)
const verificarAplicaGraduacion = (estudiante) => {
    if (!estudiante.grado) return false;
    // Normalizar eliminando puntos para comparación flexible
    const gradoNormalizado = estudiante.grado.trim().toUpperCase().replace(/\./g, '');
    return GRADOS_GRADUACION.some(grado => {
        const gradoListaNormalizado = grado.toUpperCase().replace(/\./g, '');
        return gradoNormalizado.includes(gradoListaNormalizado);
    });
};

// Obtener pago de graduación de un estudiante
const obtenerPagoGraduacion = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Obtener estudiante
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (errorEst) throw errorEst;

        // Verificar si aplica
        if (!verificarAplicaGraduacion(estudiante)) {
            return res.status(200).json({ 
                aplica: false, 
                mensaje: 'El estudiante no aplica para pago de graduación',
                pago: null 
            });
        }

        // Obtener pago existente
        const { data: pago, error } = await supabase
            .from('graduation_payments')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.status(200).json({
            aplica: true,
            pago: pago || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pago de graduación' });
    }
};

// Registrar o actualizar pago de graduación
const guardarPagoGraduacion = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { total_amount, paid_amount, payment_method_id } = req.body;

        // Obtener estudiante
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (errorEst) throw errorEst;

        // Verificar si aplica para graduación
        if (!verificarAplicaGraduacion(estudiante)) {
            return res.status(400).json({
                error: 'El estudiante no aplica para pago de graduación'
            });
        }

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

        // Verificar si ya existe
        const { data: existente } = await supabase
            .from('graduation_payments')
            .select('*')
            .eq('student_id', studentId)
            .single();

        let resultado;
        let esAbono = false;
        let montoAbonado = parseFloat(paid_amount || 0);

        if (existente) {
            esAbono = true;
            // Actualizar pago existente (agregar al monto pagado)
            const nuevoPaidAmount = parseFloat(existente.paid_amount) + montoAbonado;
            
            const { data, error } = await supabase
                .from('graduation_payments')
                .update({
                    paid_amount: nuevoPaidAmount,
                    payment_method_id: payment_method_id || existente.payment_method_id
                })
                .eq('student_id', studentId)
                .select()
                .single();

            if (error) throw error;
            resultado = data;
        } else {
            // Crear nuevo pago
            const { data, error } = await supabase
                .from('graduation_payments')
                .insert({
                    student_id: studentId,
                    total_amount: parseFloat(total_amount),
                    paid_amount: parseFloat(paid_amount || 0),
                    payment_method_id: payment_method_id || null
                })
                .select()
                .single();

            if (error) throw error;
            resultado = data;
        }

        // Generar número de recibo
        const anioActual = new Date().getFullYear();
        const numeroRecibo = `GRA-${anioActual}-${String(Date.now()).slice(-6)}`;

        const estaCancelado = parseFloat(resultado.pending_amount) === 0;

        res.status(200).json({
            pago: resultado,
            estudiante,
            numeroRecibo,
            montoAbonado,
            estaCancelado,
            esAbono,
            metodo_pago: metodo_pago_nombre
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar pago de graduación' });
    }
};

module.exports = {
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
};
