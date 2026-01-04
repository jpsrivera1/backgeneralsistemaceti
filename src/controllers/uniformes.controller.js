const supabase = require('../config/supabase');

// Obtener todas las categorías de uniformes con sus items
const obtenerCategorias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('uniform_categories')
            .select(`
                id,
                nombre,
                descripcion,
                uniform_items (
                    id,
                    nombre
                )
            `);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener la categoría de un estudiante basada en su modalidad/grado
const obtenerCategoriaEstudiante = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Primero obtener la modalidad y grado del estudiante
        const { data: estudiante, error: errorEstudiante } = await supabase
            .from('students')
            .select('modalidad, grado')
            .eq('id', studentId)
            .single();

        if (errorEstudiante) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        // Mapear modalidad/grado a categoría
        let categoriaId;
        const modalidad = estudiante.modalidad?.toLowerCase() || '';
        const grado = estudiante.grado?.toLowerCase() || '';

        // Determinar categoría basada en modalidad y grado
        // IMPORTANTE: El orden de las condiciones importa
        
        // 1. FIN DE SEMANA - todos usan las mismas prendas sin importar la carrera
        if (modalidad.includes('fin de semana') || modalidad.includes('sabatino') || modalidad.includes('sabado')) {
            // Buscar categoría "Fin de Semana"
            const { data: cat } = await supabase
                .from('uniform_categories')
                .select('id')
                .eq('nombre', 'Fin de Semana')
                .single();
            categoriaId = cat?.id;
        } 
        // 2. BÁSICOS Y CARRERA - sin importar si son matutina o vespertina
        else if (
            // Básicos: 7mo, 8vo, 9no o contiene "básico"
            grado.includes('7mo') || grado.includes('8vo') || grado.includes('9no') ||
            (grado.includes('básico') && !grado.includes('primaria')) || 
            (grado.includes('basico') && !grado.includes('primaria')) ||
            // Carreras: 4to, 5to, 6to con siglas específicas (BACO, PCB, FCB, BACH, etc.)
            grado.includes('baco') || grado.includes('pcb') || grado.includes('fcb') || 
            grado.includes('bach') || grado.includes('perito') || 
            grado.includes('secretariado') || grado.includes('magisterio') ||
            grado.includes('diversificado') || grado.includes('cc y ll') ||
            grado.includes('mecánica') || grado.includes('mecanica') ||
            grado.includes('electricidad') || grado.includes('diseño') || grado.includes('diseno') ||
            grado.includes('compu')
        ) {
            // Buscar categoría "Básicos y Carrera"
            const { data: cat } = await supabase
                .from('uniform_categories')
                .select('id')
                .eq('nombre', 'Básicos y Carrera')
                .single();
            categoriaId = cat?.id;
        } 
        // 3. KINDER Y PRIMARIA - solo kinder, prepa y primaria específicamente
        else if (
            grado.includes('kinder') || grado.includes('prepa') || grado.includes('prep') ||
            grado.includes('preprimaria') || grado.includes('párvulos') || grado.includes('parvulos') ||
            grado.includes('primaria')
        ) {
            // Buscar categoría "Kinder y Primaria"
            const { data: cat } = await supabase
                .from('uniform_categories')
                .select('id')
                .eq('nombre', 'Kinder y Primaria')
                .single();
            categoriaId = cat?.id;
        }

        if (!categoriaId) {
            // Si no se encuentra categoría, devolver todas
            const { data: todasCategorias } = await supabase
                .from('uniform_categories')
                .select(`
                    id,
                    nombre,
                    descripcion,
                    uniform_items (
                        id,
                        nombre
                    )
                `);
            
            return res.status(200).json({
                success: true,
                mensaje: 'Nivel no reconocido, mostrando todas las categorías',
                data: todasCategorias
            });
        }

        // Obtener la categoría con sus items
        const { data: categoria, error } = await supabase
            .from('uniform_categories')
            .select(`
                id,
                nombre,
                descripcion,
                uniform_items (
                    id,
                    nombre
                )
            `)
            .eq('id', categoriaId)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            modalidadEstudiante: estudiante.modalidad,
            gradoEstudiante: estudiante.grado,
            data: categoria
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener las tallas registradas de un estudiante
const obtenerTallasEstudiante = async (req, res) => {
    try {
        const { studentId } = req.params;

        const { data, error } = await supabase
            .from('student_uniform_sizes')
            .select(`
                id,
                talla,
                cantidad,
                fecha_registro,
                uniform_items (
                    id,
                    nombre,
                    uniform_categories (
                        id,
                        nombre
                    )
                )
            `)
            .eq('student_id', studentId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Guardar o actualizar tallas de un estudiante
const guardarTallas = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { tallas } = req.body; // Array de { item_id, talla, cantidad }

        if (!tallas || !Array.isArray(tallas)) {
            return res.status(400).json({ error: 'Se requiere un array de tallas' });
        }

        // Preparar los registros para upsert
        const registros = tallas.map(t => ({
            student_id: studentId,
            item_id: t.item_id,
            talla: t.talla,
            cantidad: t.cantidad || 1 // Si no se proporciona cantidad, usar 1 por defecto
        }));

        // Usar upsert para insertar o actualizar
        const { data, error } = await supabase
            .from('student_uniform_sizes')
            .upsert(registros, { 
                onConflict: 'student_id,item_id',
                ignoreDuplicates: false 
            })
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            message: 'Tallas guardadas correctamente',
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Buscar estudiantes por nombre (para el buscador)
const buscarEstudiantes = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre || nombre.length < 2) {
            return res.status(200).json([]);
        }

        const { data, error } = await supabase
            .from('students')
            .select('id, nombre, apellidos, grado, modalidad')
            .or(`nombre.ilike.%${nombre}%,apellidos.ilike.%${nombre}%`)
            .order('apellidos', { ascending: true })
            .limit(10);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Formatear respuesta con nombre completo
        const estudiantesFormateados = data.map(est => ({
            id: est.id,
            nombre_completo: `${est.nombre} ${est.apellidos}`,
            nivel: `${est.grado} - ${est.modalidad}`
        }));

        res.status(200).json(estudiantesFormateados);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar una talla específica
const eliminarTalla = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('student_uniform_sizes')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            message: 'Talla eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ==================== REPORTES DE UNIFORMES ====================

// Obtener reportes de uniformes con filtros
const getUniformReports = async (req, res) => {
    try {
        const { status = 'all', dateFrom, dateTo, uniformType = 'all' } = req.query;
        
        // Verificar si la tabla existe y obtener datos
        let payments = [];
        
        try {
            let query = supabase
                .from('pago_uniforme')
                .select(`
                    id,
                    student_id,
                    tipo_uniforme,
                    talla,
                    cantidad,
                    precio_unitario,
                    monto_adelanto,
                    estado_pago,
                    fecha_actualizacion,
                    estado_entrega
                `);

            // Aplicar filtros básicos
            if (status !== 'all') {
                query = query.eq('estado_pago', status);
            }
            
            if (dateFrom) {
                query = query.gte('fecha_actualizacion', dateFrom);
            }
            
            if (dateTo) {
                query = query.lte('fecha_actualizacion', dateTo);
            }
            
            if (uniformType !== 'all') {
                query = query.eq('tipo_uniforme', uniformType);
            }

            const { data, error } = await query.order('fecha_actualizacion', { ascending: false });

            if (error) throw error;
            
            // Obtener información de estudiantes por separado
            const paymentsWithStudents = [];
            if (data && data.length > 0) {
                for (const payment of data) {
                    let studentName = 'Estudiante desconocido';
                    
                    if (payment.student_id) {
                        try {
                            const { data: student } = await supabase
                                .from('students')
                                .select('nombre, apellidos')
                                .eq('id', payment.student_id)
                                .single();
                            
                            if (student) {
                                studentName = `${student.nombre || ''} ${student.apellidos || ''}`.trim();
                            }
                        } catch (err) {
                            console.log('Error obteniendo estudiante:', err.message);
                        }
                    }
                    
                    paymentsWithStudents.push({
                        id: payment.id,
                        student_name: studentName,
                        uniform_type: payment.tipo_uniforme || 'No especificado',
                        size: payment.talla || 'No especificado',
                        quantity: payment.cantidad || 1,
                        unit_price: payment.precio_unitario || 0,
                        total_amount: payment.monto_adelanto || 0,
                        payment_status: payment.estado_pago || 'pending',
                        payment_date: payment.fecha_actualizacion,
                        delivery_status: payment.estado_entrega || 'pending'
                    });
                }
            }
            
            payments = paymentsWithStudents;
            
        } catch (tableError) {
            console.log('Tabla pago_uniforme no existe o error:', tableError.message);
            // Retornar datos de ejemplo si la tabla no existe
            payments = [
                {
                    id: 1,
                    student_name: 'Juan Pérez',
                    uniform_type: 'Diario',
                    size: 'M',
                    quantity: 1,
                    unit_price: 50000,
                    total_amount: 50000,
                    payment_status: 'paid',
                    payment_date: '2025-01-15',
                    delivery_status: 'delivered'
                },
                {
                    id: 2,
                    student_name: 'María García',
                    uniform_type: 'Deportivo',
                    size: 'L',
                    quantity: 1,
                    unit_price: 45000,
                    total_amount: 45000,
                    payment_status: 'pending',
                    payment_date: null,
                    delivery_status: 'pending'
                }
            ];
        }

        // Calcular estadísticas
        const stats = {
            totalSales: payments.reduce((sum, p) => sum + p.total_amount, 0),
            pendingPayments: payments.filter(p => p.payment_status === 'pending').length,
            deliveredUniforms: payments.filter(p => p.delivery_status === 'delivered').length,
            pendingDeliveries: payments.filter(p => p.delivery_status === 'pending').length
        };

        res.status(200).json({
            success: true,
            payments: payments,
            stats: stats
        });

    } catch (error) {
        console.error('Error en getUniformReports:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Exportar reporte de uniformes a Excel
const exportUniformReportExcel = async (req, res) => {
    try {
        const XLSX = require('xlsx');
        
        // Datos de ejemplo para la exportación
        const excelData = [
            {
                'ID': 1,
                'Estudiante': 'Juan Pérez',
                'Grado': '10°',
                'Modalidad': 'Académico',
                'Tipo de Uniforme': 'Diario',
                'Talla': 'M',
                'Cantidad': 1,
                'Precio Unitario': 50000,
                'Total': 50000,
                'Estado de Pago': 'Pagado',
                'Fecha de Pago': new Date().toLocaleDateString(),
                'Estado de Entrega': 'Entregado',
                'Método de Pago': 'Efectivo'
            },
            {
                'ID': 2,
                'Estudiante': 'María García',
                'Grado': '11°',
                'Modalidad': 'Técnico',
                'Tipo de Uniforme': 'Deportivo',
                'Talla': 'L',
                'Cantidad': 1,
                'Precio Unitario': 45000,
                'Total': 45000,
                'Estado de Pago': 'Pendiente',
                'Fecha de Pago': '',
                'Estado de Entrega': 'Pendiente',
                'Método de Pago': 'Transferencia'
            }
        ];

        // Crear workbook
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Uniformes');

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-uniformes-${new Date().toISOString().split('T')[0]}.xlsx"`);

        // Enviar archivo
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);

    } catch (error) {
        console.error('Error en exportUniformReportExcel:', error);
        res.status(500).json({ error: 'Error al generar archivo Excel' });
    }
};

// Obtener reporte de inventario de tallas por categoría
const obtenerReporteInventarioTallas = async (req, res) => {
    try {
        // Obtener todas las tallas registradas con información de categoría e item en una sola consulta
        const { data: tallasData, error: errorTallas } = await supabase
            .from('student_uniform_sizes')
            .select(`
                talla,
                item_id,
                uniform_items!inner (
                    id,
                    nombre,
                    category_id,
                    uniform_categories!inner (
                        id,
                        nombre,
                        descripcion
                    )
                )
            `);

        if (errorTallas) {
            console.error('Error obteniendo tallas:', errorTallas);
            throw errorTallas;
        }

        // Organizar datos por categoría
        const categorias = {};

        tallasData.forEach(registro => {
            const categoria = registro.uniform_items.uniform_categories;
            const item = registro.uniform_items;
            const talla = registro.talla || 'Sin especificar';

            // Inicializar categoría si no existe
            if (!categorias[categoria.id]) {
                categorias[categoria.id] = {
                    categoria_id: categoria.id,
                    categoria_nombre: categoria.nombre,
                    categoria_descripcion: categoria.descripcion,
                    items: {}
                };
            }

            // Inicializar item si no existe
            if (!categorias[categoria.id].items[item.id]) {
                categorias[categoria.id].items[item.id] = {
                    item_id: item.id,
                    item_nombre: item.nombre,
                    tallas: {}
                };
            }

            // Contar tallas
            if (!categorias[categoria.id].items[item.id].tallas[talla]) {
                categorias[categoria.id].items[item.id].tallas[talla] = 0;
            }
            categorias[categoria.id].items[item.id].tallas[talla]++;
        });

        // Convertir a formato de array y ordenar
        const reportePorCategoria = Object.values(categorias).map(categoria => {
            const itemsArray = Object.values(categoria.items).map(item => {
                // Convertir tallas a array y ordenar
                const tallasArray = Object.entries(item.tallas)
                    .map(([talla, cantidad]) => ({ talla, cantidad }))
                    .sort((a, b) => {
                        // Ordenar tallas: numéricas primero, luego letras
                        const isANumber = !isNaN(parseInt(a.talla));
                        const isBNumber = !isNaN(parseInt(b.talla));
                        
                        if (isANumber && isBNumber) {
                            return parseInt(a.talla) - parseInt(b.talla);
                        } else if (isANumber) {
                            return -1;
                        } else if (isBNumber) {
                            return 1;
                        } else {
                            const orden = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                            return orden.indexOf(a.talla) - orden.indexOf(b.talla);
                        }
                    });

                const total = tallasArray.reduce((sum, t) => sum + t.cantidad, 0);

                return {
                    item_id: item.item_id,
                    item_nombre: item.item_nombre,
                    tallas: tallasArray,
                    total: total
                };
            });

            const total_registros = itemsArray.reduce((sum, item) => sum + item.total, 0);

            return {
                categoria_id: categoria.categoria_id,
                categoria_nombre: categoria.categoria_nombre,
                categoria_descripcion: categoria.categoria_descripcion,
                items: itemsArray,
                total_registros: total_registros
            };
        }).sort((a, b) => a.categoria_id - b.categoria_id);

        res.status(200).json({
            success: true,
            data: reportePorCategoria
        });

    } catch (error) {
        console.error('Error en obtenerReporteInventarioTallas:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message,
            details: error.stack
        });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoriaEstudiante,
    obtenerTallasEstudiante,
    guardarTallas,
    buscarEstudiantes,
    eliminarTalla,
    getUniformReports,
    exportUniformReportExcel,
    obtenerReporteInventarioTallas
};
