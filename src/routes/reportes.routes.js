const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Inicializar cliente de Twilio solo si las credenciales están configuradas correctamente
let twilioClient = null;
try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Validar que las credenciales sean reales (no valores de prueba)
    if (accountSid && authToken && 
        accountSid.startsWith('AC') && 
        accountSid !== 'your_account_sid_here' &&
        authToken !== 'your_auth_token_here') {
        const twilio = require('twilio');
        twilioClient = twilio(accountSid, authToken);
        console.log('✅ Twilio WhatsApp configurado correctamente');
    } else {
        console.log('⚠️  Twilio no configurado - Modo simulación activado');
    }
} catch (error) {
    console.log('⚠️  Error al inicializar Twilio - Modo simulación:', error.message);
}

// ==================== UTILIDAD: FECHA DE GUATEMALA ====================
const getGuatemalaDate = () => {
    const now = new Date();
    const guatemalaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    return guatemalaTime;
};

/**
 * GET /api/reportes/panel-dia
 * Obtiene el panel del día con ausentes y tardes
 */
router.get('/panel-dia', async (req, res) => {
    try {
        // Obtener la fecha actual de Guatemala
        let fechaConsulta = getGuatemalaDate();
        const diaSemana = fechaConsulta.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
        
        // Si es fin de semana, retroceder al último viernes
        if (diaSemana === 0) { // Domingo
            fechaConsulta.setDate(fechaConsulta.getDate() - 2); // Retroceder 2 días al viernes
        } else if (diaSemana === 6) { // Sábado
            fechaConsulta.setDate(fechaConsulta.getDate() - 1); // Retroceder 1 día al viernes
        }
        
        const fechaBusqueda = fechaConsulta.toISOString().split('T')[0];
        const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
        
        console.log('📅 Consultando panel del día:', fechaBusqueda, esFinDeSemana ? '(Fin de semana - mostrando último viernes)' : '');
        
        // Obtener todos los estudiantes activos (excluyendo fin de semana, primaria, prepa, kinder, cursos extras)
        const { data: todosEstudiantes, error: errorEstudiantes } = await supabase
            .from('students')
            .select('id, nombre, apellidos, grado, jornada, modalidad, nombre_encargado, telefono_encargado')
            .neq('modalidad', 'Fin de semana')
            .not('grado', 'in', '("Primaria","Prepa","Kinder")')
            .neq('modalidad', 'Curso extra')
            .order('nombre');

        if (errorEstudiantes) {
            console.error('Error al obtener estudiantes:', errorEstudiantes);
            throw errorEstudiantes;
        }

        console.log(`✅ Total estudiantes: ${todosEstudiantes?.length || 0}`);

        // Obtener asistencias del día (o del último viernes si es fin de semana)
        const { data: asistenciasHoy, error: errorAsistencias } = await supabase
            .from('asistencias')
            .select('student_id, hora_marcaje, estado_asistencia')
            .eq('fecha', fechaBusqueda);

        if (errorAsistencias) {
            console.error('Error al obtener asistencias:', errorAsistencias);
            throw errorAsistencias;
        }

        console.log(`✅ Asistencias hoy: ${asistenciasHoy?.length || 0}`);

        // Crear mapa de asistencias
        const mapaAsistencias = {};
        if (asistenciasHoy && asistenciasHoy.length > 0) {
            asistenciasHoy.forEach(asist => {
                mapaAsistencias[asist.student_id] = asist;
            });
        }

        // Clasificar estudiantes
        const ausentes = [];
        const tardes = [];

        if (todosEstudiantes && todosEstudiantes.length > 0) {
            todosEstudiantes.forEach(est => {
                const asistencia = mapaAsistencias[est.id];
                
                if (!asistencia) {
                    // No marcó asistencia - AUSENTE
                    ausentes.push({
                        ...est,
                        contacto_emergencia: est.telefono_encargado || 'N/A',
                        nombre_encargado: est.nombre_encargado || 'Sin registrar',
                        telefono_encargado: est.telefono_encargado || 'N/A'
                    });
                } else if (asistencia.estado_asistencia === 'TARDE') {
                    // Marcó tarde
                    tardes.push({
                        ...est,
                        hora_entrada: asistencia.hora_marcaje,
                        contacto_emergencia: est.telefono_encargado || 'N/A',
                        hora_marcaje: asistencia.hora_marcaje,
                        nombre_encargado: est.nombre_encargado || 'Sin registrar',
                        telefono_encargado: est.telefono_encargado || 'N/A'
                    });
                }
                // Si es A_TIEMPO, no lo incluimos en ninguna lista
            });
        }

        console.log(`📊 Ausentes: ${ausentes.length}, Tardes: ${tardes.length}`);

        res.json({
            success: true,
            fecha: fechaBusqueda,
            esFinDeSemana: esFinDeSemana,
            todos: todosEstudiantes || [],
            ausentes,
            tardes
        });
    } catch (error) {
        console.error('Error al obtener panel del día:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener panel del día',
            details: error.message
        });
    }
});

/**
 * POST /api/reportes/enviar-whatsapp
 * Envía mensaje por WhatsApp usando Twilio WhatsApp Business API
 */
router.post('/enviar-whatsapp', async (req, res) => {
    try {
        const { telefono, mensaje, studentId } = req.body;

        if (!telefono || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'Teléfono y mensaje son requeridos'
            });
        }

        // Verificar si Twilio está configurado
        if (!twilioClient) {
            console.log('Twilio no configurado - Modo simulación:', {
                telefono,
                mensaje: mensaje.substring(0, 50) + '...',
                studentId,
                fecha: getGuatemalaDate()
            });

            return res.json({
                success: true,
                mensaje: 'Mensaje registrado (Twilio no configurado)',
                mode: 'simulation',
                timestamp: getGuatemalaDate().toISOString()
            });
        }

        // Normalizar número de teléfono (asegurar formato internacional)
        let numeroWhatsApp = telefono.replace(/\D/g, ''); // Eliminar caracteres no numéricos
        
        // Si no tiene código de país, agregar +502 (Guatemala)
        if (!numeroWhatsApp.startsWith('502') && numeroWhatsApp.length === 8) {
            numeroWhatsApp = '502' + numeroWhatsApp;
        }
        
        // Agregar prefijo de WhatsApp
        numeroWhatsApp = 'whatsapp:+' + numeroWhatsApp;

        // Enviar mensaje vía Twilio
        const message = await twilioClient.messages.create({
            body: mensaje,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: numeroWhatsApp
        });

        console.log('WhatsApp enviado exitosamente:', {
            sid: message.sid,
            to: numeroWhatsApp,
            status: message.status,
            studentId,
            fecha: getGuatemalaDate()
        });

        // Opcional: Registrar en base de datos
        try {
            await supabase
                .from('whatsapp_logs')
                .insert({
                    student_id: studentId,
                    telefono: numeroWhatsApp,
                    mensaje: mensaje,
                    twilio_sid: message.sid,
                    status: message.status,
                    fecha_envio: getGuatemalaDate().toISOString()
                });
        } catch (dbError) {
            console.warn('No se pudo registrar en whatsapp_logs:', dbError.message);
        }

        res.json({
            success: true,
            mensaje: 'Mensaje enviado correctamente',
            messageSid: message.sid,
            status: message.status,
            timestamp: getGuatemalaDate().toISOString()
        });
    } catch (error) {
        console.error('Error al enviar WhatsApp:', error);
        
        // Manejar errores específicos de Twilio
        if (error.code) {
            return res.status(400).json({
                success: false,
                error: 'Error de Twilio',
                code: error.code,
                message: error.message,
                details: error.moreInfo
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al enviar mensaje',
            details: error.message
        });
    }
});

/**
 * GET /api/reportes/alumno
 * Obtiene reporte de asistencia de un alumno en un rango de fechas
 */
router.get('/alumno', async (req, res) => {
    try {
        const { studentId, fechaInicio, fechaFin } = req.query;

        if (!studentId || !fechaInicio || !fechaFin) {
            return res.status(400).json({
                success: false,
                error: 'studentId, fechaInicio y fechaFin son requeridos'
            });
        }

        // Obtener información del estudiante
        const { data: estudiante, error: errorEstudiante } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (errorEstudiante) throw errorEstudiante;

        // Obtener asistencias del estudiante en el rango
        const { data: asistencias, error: errorAsistencias } = await supabase
            .from('asistencias')
            .select('fecha, hora_marcaje, estado_asistencia')
            .eq('student_id', studentId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true });

        if (errorAsistencias) throw errorAsistencias;

        const normalizarTexto = (texto = '') =>
            texto
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim()
                .toLowerCase();

        const formatearFechaLocal = (fecha) => {
            const y = fecha.getFullYear();
            const m = String(fecha.getMonth() + 1).padStart(2, '0');
            const d = String(fecha.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const modalidadNormalizada = normalizarTexto(estudiante.modalidad || estudiante.jornada || '');
        const esModalidadFinDeSemana = modalidadNormalizada === 'fin de semana';

        const esDiaValidoParaModalidad = (fecha) => {
            const fechaObj = new Date(`${fecha}T12:00:00`);
            const diaSemana = fechaObj.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

            // Fin de semana: solo domingos. Diario (matutina/vespertina): lunes a viernes.
            if (esModalidadFinDeSemana) return diaSemana === 0;
            return diaSemana >= 1 && diaSemana <= 5;
        };

        // Calcular resumen
        let asistenciasATiempo = 0;
        let tardes = 0;
        let ausencias = 0;
        const horasLlegada = []; // Para calcular promedio de hora de llegada

        // Generar lista de días válidos del período según la modalidad.
        const fechaInicial = new Date(fechaInicio);
        const fechaFinal = new Date(fechaFin);
        const diasPeriodo = [];
        
        for (let d = new Date(fechaInicial); d <= fechaFinal; d.setDate(d.getDate() + 1)) {
            const fechaDia = formatearFechaLocal(d);
            if (esDiaValidoParaModalidad(fechaDia)) {
                diasPeriodo.push(fechaDia);
            }
        }

        // Solo tomar asistencias de los días válidos para la modalidad del estudiante.
        const asistenciasValidas = asistencias.filter(asist => esDiaValidoParaModalidad(asist.fecha));

        // Crear mapa de asistencias y calcular estadísticas
        const mapaAsistencias = {};
        asistenciasValidas.forEach(asist => {
            mapaAsistencias[asist.fecha] = asist;
            
            // Calcular estado
            if (asist.estado_asistencia === 'A_TIEMPO') {
                asistenciasATiempo++;
            } else if (asist.estado_asistencia === 'TARDE') {
                tardes++;
            }
            
            // Guardar hora para promedio (solo si marcó asistencia)
            if (asist.hora_marcaje) {
                horasLlegada.push(asist.hora_marcaje);
            }
        });

        // Contar ausencias
        diasPeriodo.forEach(fecha => {
            if (!mapaAsistencias[fecha]) {
                ausencias++;
            }
        });

        // Calcular rango de hora de llegada (solo días con marcaje)
        let horaRangoTexto = 'N/A';
        
        if (horasLlegada.length > 0) {
            // Convertir horas a minutos desde medianoche
            const minutosLlegada = horasLlegada.map(hora => {
                const [h, m] = hora.split(':').map(Number);
                return h * 60 + m;
            });

            // Para jornada matutina, mostrar rango institucional fijo.
            if (estudiante.jornada === 'Matutina') {
                horaRangoTexto = '07:00 - 08:00';
            } else {
                const minimoMinutos = Math.min(...minutosLlegada);
                const maximoMinutos = Math.max(...minutosLlegada);
            
                const formatearMinutosAHora = (minutosTotal) => {
                    const h = Math.floor(minutosTotal / 60);
                    const m = minutosTotal % 60;
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                };

                const horaMin = formatearMinutosAHora(minimoMinutos);
                const horaMax = formatearMinutosAHora(maximoMinutos);
                horaRangoTexto = minimoMinutos === maximoMinutos ? horaMin : `${horaMin} - ${horaMax}`;
            }
        }

        res.json({
            success: true,
            estudiante,
            resumen: {
                asistencias: asistenciasATiempo,
                tardes,
                ausencias,
                total_dias: diasPeriodo.length,
                hora_rango_llegada: horaRangoTexto,
                hora_promedio_llegada: horaRangoTexto
            }
        });
    } catch (error) {
        console.error('Error al obtener reporte de alumno:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener reporte',
            details: error.message
        });
    }
});

module.exports = router;
