const supabase = require('../config/supabase');

// ==================== DASHBOARD COMPLETO ====================

// Obtener todos los datos del dashboard
const getDashboardData = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        const [
            incomeByDay,
            incomeByMonth,
            incomeByType,
            studentsByType,
            pendingPayments,
            totalMora,
            incomeByPaymentMethod,
            monthlyIncome,
            dailyIncome
        ] = await Promise.all([
            getIncomeByDayData(start, end),
            getIncomeByMonthData(start, end),
            getIncomeByTypeData(start, end),
            getStudentsByTypeData(),
            getPendingPaymentsData(start, end),
            getTotalMoraData(start, end),
            getIncomeByPaymentMethodData(start, end),
            getMonthlyIncomeData(start, end),
            getDailyIncomeData()
        ]);

        res.status(200).json({
            incomeByDay,
            incomeByMonth,
            incomeByType,
            studentsByType,
            pendingPayments,
            totalMora: totalMora.total_mora || 0,
            incomeByPaymentMethod,
            monthlyIncome: monthlyIncome.total_ingresos || 0,
            dailyIncome: dailyIncome.total_ingresos || 0
        });
    } catch (error) {
        console.error('Error en getDashboardData:', error);
        res.status(500).json({ error: 'Error al obtener datos del dashboard' });
    }
};

// Función auxiliar: Ingresos por día
const getIncomeByDayData = async (start, end) => {
    try {
        const ingresosPorDia = {};
        
        // Tablas de pago a consultar
        const tablasPago = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto' },
            { tabla: 'graduation_payments', campo: 'paid_amount' },
            { tabla: 'course_payments', campo: 'amount' }
        ];
        
        // Obtener pagos de todas las tablas
        for (const config of tablasPago) {
            try {
                let query = supabase
                    .from(config.tabla)
                    .select(`created_at, ${config.campo}`);
                
                // Aplicar filtro de fechas si se proporcionan
                if (start && end) {
                    query = query.gte('created_at', start).lte('created_at', end);
                }
                
                const { data } = await query;
                
                if (data) {
                    data.forEach(pago => {
                        const fecha = pago.created_at || new Date().toISOString();
                        const dia = fecha.split('T')[0];
                        if (dia) {
                            ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + parseFloat(pago[config.campo] || 0);
                        }
                    });
                }
            } catch (err) {
                // Tabla no existe
            }
        }
        
        return Object.entries(ingresosPorDia)
            .map(([dia, total_ingresos]) => ({ dia, total_ingresos }))
            .sort((a, b) => new Date(b.dia).getTime() - new Date(a.dia).getTime())
            .slice(0, 30);
    } catch (error) {
        console.error('Error en getIncomeByDayData:', error);
        return [];
    }
};

// Función auxiliar: Ingresos por mes  
const getIncomeByMonthData = async (start, end) => {
    try {
        const ingresosPorMes = {};
        
        // Tablas de pago a consultar
        const tablasPago = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto' },
            { tabla: 'graduation_payments', campo: 'paid_amount' },
            { tabla: 'course_payments', campo: 'amount' }
        ];
        
        // Obtener pagos de todas las tablas
        for (const config of tablasPago) {
            try {
                let query = supabase
                    .from(config.tabla)
                    .select(`created_at, ${config.campo}`);
                
                // Aplicar filtro de fechas si se proporcionan
                if (start && end) {
                    query = query.gte('created_at', start).lte('created_at', end);
                }
                
                const { data } = await query;
                
                if (data) {
                    data.forEach(pago => {
                        const fecha = pago.created_at || new Date().toISOString();
                        const mes = fecha.substring(0, 7); // YYYY-MM
                        ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + parseFloat(pago[config.campo] || 0);
                    });
                }
            } catch (err) {
                // Tabla no existe
            }
        }
        
        return Object.entries(ingresosPorMes)
            .map(([mes, total_ingresos]) => ({ mes, total_ingresos }))
            .sort((a, b) => b.mes.localeCompare(a.mes))
            .slice(0, 12);
    } catch (error) {
        console.error('Error en getIncomeByMonthData:', error);
        return [];
    }
};

// Función auxiliar: Ingresos por tipo de pago
const getIncomeByTypeData = async (start, end) => {
    try {
        const tipos = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado', tipo: 'COLEGIATURAS' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto', tipo: 'INSCRIPCIÓN' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto', tipo: 'UNIFORMES' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto', tipo: 'LIBROS LECTURA' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto', tipo: 'COPIAS ANUALES' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto', tipo: 'LIBRO INGLÉS' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto', tipo: 'EXCURSIÓN' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto', tipo: 'ESPECIALIDAD' },
            { tabla: 'graduation_payments', campo: 'paid_amount', tipo: 'GRADUACIÓN' },
            { tabla: 'course_payments', campo: 'amount', tipo: 'CURSOS EXTRA' }
        ];
        
        const result = [];
        
        for (const config of tipos) {
            try {
                let query = supabase
                    .from(config.tabla)
                    .select(`created_at, ${config.campo}`);
                
                // Aplicar filtro de fechas si se proporcionan
                if (start && end) {
                    query = query.gte('created_at', start).lte('created_at', end);
                }
                
                const { data } = await query;
                
                const total = data ? data.reduce((sum, item) => {
                    return sum + parseFloat(item[config.campo] || 0);
                }, 0) : 0;
                
                if (total > 0) {
                    result.push({
                        tipo_pago: config.tipo,
                        total_ingresos: total
                    });
                }
            } catch (err) {
                console.log(`Tabla ${config.tabla} no existe o error:`, err.message);
            }
        }
        
        return result.sort((a, b) => b.total_ingresos - a.total_ingresos);
    } catch (error) {
        console.error('Error en getIncomeByTypeData:', error);
        return [];
    }
};

// Función auxiliar: Estudiantes por tipo
const getStudentsByTypeData = async () => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('tipo_estudiante')
            .not('tipo_estudiante', 'is', null);
            
        if (error) throw error;
        
        // Agrupar por tipo
        const grouped = data.reduce((acc, student) => {
            acc[student.tipo_estudiante] = (acc[student.tipo_estudiante] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(grouped).map(([tipo_estudiante, total]) => ({
            tipo_estudiante,
            total
        }));
    } catch (error) {
        console.error('Error en getStudentsByTypeData:', error);
        return [];
    }
};

// Función auxiliar: Pagos pendientes
const getPendingPaymentsData = async (start, end) => {
    try {
        const pendingPayments = [];
        
        // Obtener estudiantes
        const { data: students } = await supabase
            .from('students')
            .select('id, nombre, apellidos');
        
        if (!students) return [];
        
        // Tablas de pago a consultar (sin colegiaturas y cursos extra que se manejan diferente)
        const tablasPago = [
            { tabla: 'pago_inscripcion', tipo: 'INSCRIPCIÓN' },
            { tabla: 'pago_uniforme', tipo: 'UNIFORME' },
            { tabla: 'pago_libros_lectura', tipo: 'LIBROS' },
            { tabla: 'pago_copias_anuales', tipo: 'COPIAS' },
            { tabla: 'pago_libro_ingles', tipo: 'INGLÉS' },
            { tabla: 'pago_excursion', tipo: 'EXCURSIÓN' },
            { tabla: 'pago_especialidad', tipo: 'ESPECIALIDAD' }
        ];
        
        // Revisar cada tabla de pagos
        for (const config of tablasPago) {
            try {
                let query = supabase
                    .from(config.tabla)
                    .select('student_id, monto_pendiente, created_at')
                    .gt('monto_pendiente', 0);
                
                // Aplicar filtro de fechas si se proporcionan
                if (start && end) {
                    query = query.gte('created_at', start).lte('created_at', end);
                }
                
                const { data: pagos } = await query;
                
                if (pagos) {
                    pagos.forEach(pago => {
                        const student = students.find(s => s.id === pago.student_id);
                        if (student) {
                            pendingPayments.push({
                                estudiante: `${student.nombre} ${student.apellidos}`,
                                tipo_pago: config.tipo,
                                monto_pendiente: parseFloat(pago.monto_pendiente || 0)
                            });
                        }
                    });
                }
            } catch (err) {
                console.log(`Tabla ${config.tabla} no encontrada:`, err.message);
            }
        }
        
        // Graduación
        try {
            let query = supabase
                .from('graduation_payments')
                .select('student_id, pending_amount, created_at')
                .gt('pending_amount', 0);
            
            // Aplicar filtro de fechas si se proporcionan
            if (start && end) {
                query = query.gte('created_at', start).lte('created_at', end);
            }
            
            const { data: graduaciones } = await query;
            
            if (graduaciones) {
                graduaciones.forEach(pago => {
                    const student = students.find(s => s.id === pago.student_id);
                    if (student) {
                        pendingPayments.push({
                            estudiante: `${student.nombre} ${student.apellidos}`,
                            tipo_pago: 'GRADUACIÓN',
                            monto_pendiente: parseFloat(pago.pending_amount || 0)
                        });
                    }
                });
            }
        } catch (err) {
            console.log('Tabla graduation_payments no encontrada:', err.message);
        }
        
        // Ordenar por monto pendiente descendente y tomar los primeros 10
        return pendingPayments
            .sort((a, b) => b.monto_pendiente - a.monto_pendiente)
            .slice(0, 10);
    } catch (error) {
        console.error('Error en getPendingPaymentsData:', error);
        return [];
    }
};

// Función auxiliar: Total de mora
const getTotalMoraData = async (start, end) => {
    try {
        let total_mora = 0;
        
        // Tablas que tienen campo mora
        const tablasConMora = [
            'pago_colegiaturas',
            'pago_inscripcion',
            'pago_uniforme',
            'pago_libros_lectura',
            'pago_copias_anuales',
            'pago_libro_ingles',
            'pago_excursion',
            'pago_especialidad'
        ];
        
        // Sumar mora de todas las tablas
        for (const tabla of tablasConMora) {
            try {
                let query = supabase
                    .from(tabla)
                    .select('mora, created_at');
                
                // Aplicar filtro de fechas si se proporcionan
                if (start && end) {
                    query = query.gte('created_at', start).lte('created_at', end);
                }
                
                const { data } = await query;
                
                if (data) {
                    total_mora += data.reduce((sum, item) => {
                        return sum + parseFloat(item.mora || 0);
                    }, 0);
                }
            } catch (err) {
                console.log(`Tabla ${tabla} no encontrada o sin campo mora:`, err.message);
            }
        }
        
        return { total_mora };
    } catch (error) {
        console.error('Error en getTotalMoraData:', error);
        return { total_mora: 0 };
    }
};

// Función auxiliar: Ingresos por método de pago
const getIncomeByPaymentMethodData = async (start, end) => {
    try {
        // Obtener métodos de pago
        const { data: methods } = await supabase
            .from('payment_methods')
            .select('*');
        
        if (!methods) return [];
        
        const result = [];
        
        // Tablas de pago a consultar
        const tablasPago = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto' },
            { tabla: 'graduation_payments', campo: 'paid_amount' },
            { tabla: 'course_payments', campo: 'amount' }
        ];
        
        for (const method of methods) {
            let total = 0;
            
            // Sumar de todas las tablas
            for (const config of tablasPago) {
                try {
                    let query = supabase
                        .from(config.tabla)
                        .select(`created_at, ${config.campo}`)
                        .eq('payment_method_id', method.id);
                    
                    // Aplicar filtro de fechas si se proporcionan
                    if (start && end) {
                        query = query.gte('created_at', start).lte('created_at', end);
                    }
                    
                    const { data: pagos } = await query;
                    
                    if (pagos) {
                        total += pagos.reduce((sum, p) => sum + parseFloat(p[config.campo] || 0), 0);
                    }
                } catch (err) {
                    // Tabla no existe o error, continuar con la siguiente
                }
            }
            
            if (total > 0) {
                result.push({
                    metodo_pago: method.name,
                    total_ingresos: total
                });
            }
        }
        
        return result.sort((a, b) => b.total_ingresos - a.total_ingresos);
    } catch (error) {
        console.error('Error en getIncomeByPaymentMethodData:', error);
        return [];
    }
};

// Función auxiliar: Ingresos mensuales con filtro de fecha
const getMonthlyIncomeData = async (start, end) => {
    try {
        let total_ingresos = 0;
        
        // Tablas de pago a consultar - SIN FILTRO DE FECHA para incluir TODOS los pagos
        const tablasPago = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto' },
            { tabla: 'graduation_payments', campo: 'paid_amount' },
            { tabla: 'course_payments', campo: 'amount' }
        ];
        
        // Sumar de todas las tablas
        for (const config of tablasPago) {
            try {
                const { data } = await supabase
                    .from(config.tabla)
                    .select(config.campo);
                
                if (data) {
                    total_ingresos += data.reduce((sum, pago) => {
                        return sum + parseFloat(pago[config.campo] || 0);
                    }, 0);
                }
            } catch (err) {
                // Tabla no existe, continuar con la siguiente
            }
        }
        
        return { total_ingresos };
    } catch (error) {
        console.error('Error en getMonthlyIncomeData:', error);
        return { total_ingresos: 0 };
    }
};

// Función auxiliar: Ingresos del día actual
const getDailyIncomeData = async () => {
    try {
        let total_ingresos = 0;
        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Tablas de pago a consultar
        const tablasPago = [
            { tabla: 'pago_colegiaturas', campo: 'total_pagado' },
            { tabla: 'pago_inscripcion', campo: 'monto_adelanto' },
            { tabla: 'pago_uniforme', campo: 'monto_adelanto' },
            { tabla: 'pago_libros_lectura', campo: 'monto_adelanto' },
            { tabla: 'pago_copias_anuales', campo: 'monto_adelanto' },
            { tabla: 'pago_libro_ingles', campo: 'monto_adelanto' },
            { tabla: 'pago_excursion', campo: 'monto_adelanto' },
            { tabla: 'pago_especialidad', campo: 'monto_adelanto' },
            { tabla: 'graduation_payments', campo: 'paid_amount' },
            { tabla: 'course_payments', campo: 'amount' }
        ];
        
        // Sumar de todas las tablas solo los pagos de hoy
        for (const config of tablasPago) {
            try {
                const { data } = await supabase
                    .from(config.tabla)
                    .select(`created_at, ${config.campo}`)
                    .gte('created_at', hoy)
                    .lt('created_at', `${hoy}T23:59:59`);
                
                if (data) {
                    total_ingresos += data.reduce((sum, pago) => {
                        return sum + parseFloat(pago[config.campo] || 0);
                    }, 0);
                }
            } catch (err) {
                // Tabla no existe, continuar con la siguiente
            }
        }
        
        return { total_ingresos };
    } catch (error) {
        console.error('Error en getDailyIncomeData:', error);
        return { total_ingresos: 0 };
    }
};

// Obtener ingresos del día
const getIngresosDia = async (req, res) => {
    try {
        const data = await getIncomeByDayData();
        const hoy = new Date().toISOString().split('T')[0];
        const ingresoHoy = data.find(item => item.dia === hoy) || { total_ingresos: 0 };
        
        res.status(200).json({ 
            total: ingresoHoy.total_ingresos, 
            fecha: hoy,
            data: data.slice(0, 10) // Últimos 10 días
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos del día' });
    }
};

// Obtener ingresos por rango de fechas
const getIngresosPorRango = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        const { data: colegiaturas } = await supabase
            .from('pago_colegiaturas')
            .select('total_pagado, fecha_pago')
            .gte('fecha_pago', fechaInicio)
            .lte('fecha_pago', fechaFin);

        const { data: cursos } = await supabase
            .from('pago_cursos')
            .select('total_pagado, fecha_pago')
            .gte('fecha_pago', fechaInicio)
            .lte('fecha_pago', fechaFin);

        let total = 0;
        if (colegiaturas) total += colegiaturas.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0);
        if (cursos) total += cursos.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0);

        res.status(200).json({ total, fechaInicio, fechaFin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos por rango' });
    }
};

// Obtener ingresos por mes
const getIngresosPorMes = async (req, res) => {
    try {
        const { mes, anio } = req.query;
        const anioActual = anio || new Date().getFullYear();
        
        const { data: colegiaturas } = await supabase
            .from('pago_colegiaturas')
            .select('total_pagado')
            .eq('mes', mes?.toUpperCase())
            .eq('anio', anioActual);

        let total = 0;
        if (colegiaturas) total = colegiaturas.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0);

        res.status(200).json({ total, mes, anio: anioActual });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos del mes' });
    }
};

// Obtener total histórico de ingresos
const getIngresosHistoricos = async (req, res) => {
    try {
        // Sumar de todas las tablas de pago
        const tablasPago = [
            'pago_inscripcion',
            'pago_uniforme',
            'pago_libros_lectura',
            'pago_copias_anuales',
            'pago_libro_ingles',
            'pago_excursion',
            'pago_especialidad',
            'pago_colegiaturas',
            'pago_cursos',
            'pago_graduacion'
        ];

        let totalGeneral = 0;

        for (const tabla of tablasPago) {
            try {
                const { data } = await supabase
                    .from(tabla)
                    .select('monto_adelanto');
                
                if (data) {
                    totalGeneral += data.reduce((sum, p) => sum + parseFloat(p.monto_adelanto || 0), 0);
                }
            } catch (e) {
                // Ignorar si la tabla no existe
            }
        }

        // Agregar colegiaturas
        const { data: colegiaturas } = await supabase
            .from('pago_colegiaturas')
            .select('total_pagado');
        
        if (colegiaturas) {
            totalGeneral += colegiaturas.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0);
        }

        res.status(200).json({ total: totalGeneral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos históricos' });
    }
};

// Ingresos por tipo de pago
const getIngresosPorTipoPago = async (req, res) => {
    try {
        const tipos = {
            'Inscripción': 'pago_inscripcion',
            'Uniformes': 'pago_uniforme',
            'Libros de Lectura': 'pago_libros_lectura',
            'Copias Anuales': 'pago_copias_anuales',
            'Libro de Inglés': 'pago_libro_ingles',
            'Excursión': 'pago_excursion',
            'Especialidad': 'pago_especialidad',
            'Graduación': 'pago_graduacion'
        };

        const resultado = [];

        for (const [nombre, tabla] of Object.entries(tipos)) {
            try {
                const { data } = await supabase.from(tabla).select('monto_adelanto');
                const total = data ? data.reduce((sum, p) => sum + parseFloat(p.monto_adelanto || 0), 0) : 0;
                resultado.push({ name: nombre, value: total });
            } catch (e) {
                resultado.push({ name: nombre, value: 0 });
            }
        }

        // Colegiaturas
        const { data: colegiaturas } = await supabase.from('pago_colegiaturas').select('total_pagado');
        const totalColegiaturas = colegiaturas ? colegiaturas.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0) : 0;
        resultado.push({ name: 'Colegiaturas', value: totalColegiaturas });

        // Cursos
        const { data: cursos } = await supabase.from('pago_cursos').select('total_pagado');
        const totalCursos = cursos ? cursos.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0) : 0;
        resultado.push({ name: 'Cursos', value: totalCursos });

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos por tipo' });
    }
};

// Ingresos por método de pago
const getIngresosPorMetodoPago = async (req, res) => {
    try {
        const { data: metodos } = await supabase
            .from('payment_methods')
            .select('id, name');

        const resultado = [];

        for (const metodo of (metodos || [])) {
            // Sumar pagos con este método
            const { data: colegiaturas } = await supabase
                .from('pago_colegiaturas')
                .select('total_pagado')
                .eq('payment_method_id', metodo.id);

            const total = colegiaturas ? colegiaturas.reduce((sum, p) => sum + parseFloat(p.total_pagado || 0), 0) : 0;
            resultado.push({ name: metodo.name, value: total });
        }

        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ingresos por método' });
    }
};

// ==================== PENDIENTES ====================

// Total pendiente de cobro
const getTotalPendiente = async (req, res) => {
    try {
        const { data } = await supabase
            .from('vista_pagos_estudiantes')
            .select('total_pendiente');

        const total = data ? data.reduce((sum, p) => sum + parseFloat(p.total_pendiente || 0), 0) : 0;

        res.status(200).json({ total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener total pendiente' });
    }
};

// Estudiantes con pagos pendientes
const getEstudiantesConPendientes = async (req, res) => {
    try {
        const { data } = await supabase
            .from('vista_pagos_estudiantes')
            .select('*')
            .gt('total_pendiente', 0)
            .order('total_pendiente', { ascending: false });

        res.status(200).json(data || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estudiantes con pendientes' });
    }
};

// Top deudores
const getTopDeudores = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;

        const { data } = await supabase
            .from('vista_pagos_estudiantes')
            .select('*')
            .gt('total_pendiente', 0)
            .order('total_pendiente', { ascending: false })
            .limit(limite);

        res.status(200).json(data || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener top deudores' });
    }
};

// Total de mora
const getTotalMora = async (req, res) => {
    try {
        const { data } = await supabase
            .from('pago_colegiaturas')
            .select('mora');

        const total = data ? data.reduce((sum, p) => sum + parseFloat(p.mora || 0), 0) : 0;

        res.status(200).json({ total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener total de mora' });
    }
};

// ==================== ESTUDIANTES ====================

// Estadísticas de estudiantes
const getEstadisticasEstudiantes = async (req, res) => {
    try {
        const { data: estudiantes } = await supabase
            .from('students')
            .select('id, estado, tipo_estudiante, jornada, modalidad, curso_extra_id');

        if (!estudiantes) {
            return res.status(200).json({
                total: 0,
                activos: 0,
                inactivos: 0,
                regular: 0,
                curso: 0,
                porJornada: {},
                porModalidad: {}
            });
        }

        const activos = estudiantes.filter(e => e.estado === 'ACTIVO' || !e.estado);
        const inactivos = estudiantes.filter(e => e.estado === 'INACTIVO');
        const regular = estudiantes.filter(e => e.tipo_estudiante === 'REGULAR');
        const curso = estudiantes.filter(e => e.tipo_estudiante === 'CURSO');

        // Agrupar por jornada
        const porJornada = estudiantes.reduce((acc, est) => {
            const jornada = est.jornada || 'Sin definir';
            acc[jornada] = (acc[jornada] || 0) + 1;
            return acc;
        }, {});

        // Agrupar por modalidad
        const porModalidad = estudiantes.reduce((acc, est) => {
            const modalidad = est.modalidad || 'Sin definir';
            acc[modalidad] = (acc[modalidad] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            total: estudiantes.length,
            activos: activos.length,
            inactivos: inactivos.length,
            regular: regular.length,
            curso: curso.length,
            porJornada,
            porModalidad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

// ==================== CURSOS ====================

// Estadísticas de cursos
const getEstadisticasCursos = async (req, res) => {
    try {
        const { data: cursos } = await supabase
            .from('extra_courses')
            .select('*');

        const { data: estudiantes } = await supabase
            .from('students')
            .select('curso_extra_id')
            .eq('tipo_estudiante', 'CURSO');

        // Contar estudiantes por curso
        const estudiantesPorCurso = (cursos || []).map(curso => {
            const inscritos = (estudiantes || []).filter(e => e.curso_extra_id === curso.id).length;
            return { ...curso, inscritos };
        }).sort((a, b) => b.inscritos - a.inscritos);

        res.status(200).json({
            totalCursos: cursos?.length || 0,
            totalInscritos: estudiantes?.length || 0,
            cursos: estudiantesPorCurso
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas de cursos' });
    }
};

// ==================== RESUMEN GENERAL ====================

const getResumenDashboard = async (req, res) => {
    try {
        // Obtener datos básicos
        const { data: estudiantes } = await supabase.from('students').select('id, estado, tipo_estudiante');
        const { data: cursos } = await supabase.from('extra_courses').select('id');
        const { data: pagosResumen } = await supabase.from('vista_pagos_estudiantes').select('*');

        const estudiantesData = estudiantes || [];
        const activos = estudiantesData.filter(e => e.estado === 'ACTIVO' || !e.estado);
        const regular = estudiantesData.filter(e => e.tipo_estudiante === 'REGULAR');
        const curso = estudiantesData.filter(e => e.tipo_estudiante === 'CURSO');

        let totalIngresos = 0;
        let totalPendiente = 0;

        if (pagosResumen) {
            pagosResumen.forEach(p => {
                totalIngresos += parseFloat(p.total_pagado || 0);
                totalPendiente += parseFloat(p.total_pendiente || 0);
            });
        }

        res.status(200).json({
            estudiantes: {
                total: estudiantesData.length,
                activos: activos.length,
                regular: regular.length,
                curso: curso.length
            },
            cursos: {
                total: cursos?.length || 0
            },
            finanzas: {
                totalIngresos,
                totalPendiente,
                estudiantesConDeuda: pagosResumen?.filter(p => parseFloat(p.total_pendiente || 0) > 0).length || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
    }
};

// Endpoints individuales para el nuevo dashboard
const getIncomeByDay = async (req, res) => {
    try {
        const data = await getIncomeByDayData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getIncomeByDay:', error);
        res.status(500).json({ error: 'Error al obtener ingresos por día' });
    }
};

const getIncomeByMonth = async (req, res) => {
    try {
        const data = await getIncomeByMonthData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getIncomeByMonth:', error);
        res.status(500).json({ error: 'Error al obtener ingresos por mes' });
    }
};

const getIncomeByType = async (req, res) => {
    try {
        const data = await getIncomeByTypeData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getIncomeByType:', error);
        res.status(500).json({ error: 'Error al obtener ingresos por tipo' });
    }
};

const getStudentsByType = async (req, res) => {
    try {
        const data = await getStudentsByTypeData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getStudentsByType:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes por tipo' });
    }
};

const getPendingPayments = async (req, res) => {
    try {
        const data = await getPendingPaymentsData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getPendingPayments:', error);
        res.status(500).json({ error: 'Error al obtener pagos pendientes' });
    }
};

const getTotalMoraEndpoint = async (req, res) => {
    try {
        const data = await getTotalMoraData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getTotalMoraEndpoint:', error);
        res.status(500).json({ error: 'Error al obtener total de mora' });
    }
};

const getIncomeByPaymentMethod = async (req, res) => {
    try {
        const data = await getIncomeByPaymentMethodData();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error en getIncomeByPaymentMethod:', error);
        res.status(500).json({ error: 'Error al obtener ingresos por método de pago' });
    }
};

// Obtener reporte detallado para PDF
const getDetailedReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        // Obtener datos detallados de cada tipo de pago
        const [
            colegiaturas,
            inscripciones,
            uniformes,
            librosLectura,
            copiasAnuales,
            libroIngles,
            excursion,
            especialidad,
            graduaciones,
            cursosExtra
        ] = await Promise.all([
            getDetalleColegiaturas(start, end),
            getDetalleInscripciones(start, end),
            getDetalleUniformes(start, end),
            getDetalleLibrosLectura(start, end),
            getDetalleCopiasAnuales(start, end),
            getDetalleLibroIngles(start, end),
            getDetalleExcursion(start, end),
            getDetalleEspecialidad(start, end),
            getDetalleGraduaciones(start, end),
            getDetalleCursosExtra(start, end)
        ]);

        // Calcular resumen
        const summary = [
            { tipo_pago: 'COLEGIATURAS', cantidad_pagos: colegiaturas.length, total_ingresos: colegiaturas.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'INSCRIPCIÓN', cantidad_pagos: inscripciones.length, total_ingresos: inscripciones.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'UNIFORMES', cantidad_pagos: uniformes.length, total_ingresos: uniformes.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'LIBROS LECTURA', cantidad_pagos: librosLectura.length, total_ingresos: librosLectura.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'COPIAS ANUALES', cantidad_pagos: copiasAnuales.length, total_ingresos: copiasAnuales.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'LIBRO INGLÉS', cantidad_pagos: libroIngles.length, total_ingresos: libroIngles.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'EXCURSIÓN', cantidad_pagos: excursion.length, total_ingresos: excursion.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'ESPECIALIDAD', cantidad_pagos: especialidad.length, total_ingresos: especialidad.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'GRADUACIÓN', cantidad_pagos: graduaciones.length, total_ingresos: graduaciones.reduce((sum, p) => sum + p.monto, 0) },
            { tipo_pago: 'CURSOS EXTRA', cantidad_pagos: cursosExtra.length, total_ingresos: cursosExtra.reduce((sum, p) => sum + p.monto, 0) }
        ];

        const totalGeneral = summary.reduce((sum, item) => sum + item.total_ingresos, 0);

        res.status(200).json({
            summary,
            totalGeneral,
            details: {
                colegiaturas,
                inscripciones,
                uniformes,
                libros_lectura: librosLectura,
                copias_anuales: copiasAnuales,
                libro_ingles: libroIngles,
                excursion,
                especialidad,
                graduaciones,
                cursos_extra: cursosExtra
            }
        });
    } catch (error) {
        console.error('Error en getDetailedReport:', error);
        res.status(500).json({ error: 'Error al obtener reporte detallado' });
    }
};

// Funciones auxiliares para obtener detalles de cada tipo de pago
const getDetalleColegiaturas = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_colegiaturas')
            .select('*');
        
        if (error) {
            console.error('Error en query colegiaturas:', error);
            return [];
        }

        if (!data || data.length === 0) return [];

        // Obtener métodos de pago
        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        // Obtener estudiantes
        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            mes: p.mes_pagado || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.total_pagado || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleColegiaturas:', error);
        return [];
    }
};

const getDetalleInscripciones = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_inscripcion')
            .select('*');
        
        if (error) {
            console.error('Error en query inscripciones:', error);
            return [];
        }

        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleInscripciones:', error);
        return [];
    }
};

const getDetalleUniformes = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_uniforme')
            .select('*');
        
        if (error) {
            console.error('Error en query uniformes:', error);
            return [];
        }

        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleUniformes:', error);
        return [];
    }
};

const getDetalleLibrosLectura = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_libros_lectura')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleLibrosLectura:', error);
        return [];
    }
};

const getDetalleCopiasAnuales = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_copias_anuales')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleCopiasAnuales:', error);
        return [];
    }
};

const getDetalleLibroIngles = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_libro_ingles')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleLibroIngles:', error);
        return [];
    }
};

const getDetalleExcursion = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_excursion')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleExcursion:', error);
        return [];
    }
};

const getDetalleEspecialidad = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('pago_especialidad')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.monto_adelanto || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleEspecialidad:', error);
        return [];
    }
};

const getDetalleGraduaciones = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('graduation_payments')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.paid_amount || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleGraduaciones:', error);
        return [];
    }
};

const getDetalleCursosExtra = async (start, end) => {
    try {
        const { data, error } = await supabase
            .from('course_payments')
            .select('*');
        
        if (error) return [];
        if (!data || data.length === 0) return [];

        const { data: methods } = await supabase.from('payment_methods').select('*');
        const methodsMap = methods ? Object.fromEntries(methods.map(m => [m.id, m.name])) : {};

        const studentIds = [...new Set(data.map(p => p.estudiante_id).filter(Boolean))];
        const { data: students } = await supabase
            .from('estudiantes')
            .select('id, nombres, apellidos')
            .in('id', studentIds);
        const studentsMap = students ? Object.fromEntries(students.map(s => [s.id, `${s.nombres} ${s.apellidos}`])) : {};

        const courseIds = [...new Set(data.map(p => p.curso_id).filter(Boolean))];
        const { data: courses } = await supabase
            .from('cursos')
            .select('id, nombre')
            .in('id', courseIds);
        const coursesMap = courses ? Object.fromEntries(courses.map(c => [c.id, c.nombre])) : {};

        return data.map(p => ({
            estudiante: studentsMap[p.estudiante_id] || 'N/A',
            curso: coursesMap[p.curso_id] || 'N/A',
            fecha: p.created_at ? new Date(p.created_at).toLocaleDateString('es-GT') : 'N/A',
            metodo_pago: methodsMap[p.payment_method_id] || 'N/A',
            monto: parseFloat(p.amount || 0)
        }));
    } catch (error) {
        console.error('Error en getDetalleCursosExtra:', error);
        return [];
    }
};

module.exports = {
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
};
