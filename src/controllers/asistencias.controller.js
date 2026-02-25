const supabase = require('../config/supabase');

// ==================== UTILIDAD: FECHA DE GUATEMALA ====================
const getGuatemalaDate = () => {
    const now = new Date();
    const guatemalaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
    return guatemalaTime;
};

const getGuatemalaDateString = () => {
    return getGuatemalaDate().toISOString().split('T')[0];
};

// Variable temporal para almacenar el último UID detectado
let ultimoUIDDetectado = {
  uid: null,
  timestamp: null
};

// Endpoint para que el script Node.js envíe el UID detectado
const recibirUIDDetectado = (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID es requerido' });
    }

    // Guardar el UID con timestamp
    ultimoUIDDetectado = {
      uid: uid.toUpperCase().replace(/\s+/g, ''),
      timestamp: Date.now()
    };

    res.json({ 
      success: true, 
      message: 'UID recibido',
      uid: ultimoUIDDetectado.uid
    });
  } catch (error) {
    console.error('Error al recibir UID:', error);
    res.status(500).json({ error: 'Error al procesar el UID' });
  }
};

// Endpoint para que el frontend obtenga el último UID detectado
const obtenerUltimoUID = (req, res) => {
  try {
    // Si el UID tiene más de 10 segundos, lo consideramos viejo
    const TIEMPO_EXPIRACION = 10000; // 10 segundos
    
    if (ultimoUIDDetectado.uid && ultimoUIDDetectado.timestamp) {
      const tiempoTranscurrido = Date.now() - ultimoUIDDetectado.timestamp;
      
      if (tiempoTranscurrido < TIEMPO_EXPIRACION) {
        // UID válido, lo enviamos y lo limpiamos
        const uid = ultimoUIDDetectado.uid;
        ultimoUIDDetectado = { uid: null, timestamp: null };
        
        return res.json({ 
          uid,
          detectado: true
        });
      }
    }

    // No hay UID nuevo
    res.json({ 
      uid: null,
      detectado: false
    });
  } catch (error) {
    console.error('Error al obtener último UID:', error);
    res.status(500).json({ error: 'Error al obtener el UID' });
  }
};

// Asignar UID de tarjeta a un estudiante
const asignarUID = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { uid_tarjeta } = req.body;

        if (!uid_tarjeta) {
            return res.status(400).json({ error: 'UID de tarjeta requerido' });
        }

        // Normalizar UID (uppercase, sin espacios)
        const uidNormalizado = uid_tarjeta.trim().toUpperCase();

        // Verificar que el UID no esté ya asignado a otro estudiante
        const { data: existente, error: errorCheck } = await supabase
            .from('students')
            .select('id, nombre, apellidos')
            .eq('uid_tarjeta', uidNormalizado)
            .neq('id', studentId)
            .single();

        if (existente) {
            return res.status(400).json({ 
                error: `Esta tarjeta ya está asignada a ${existente.nombre} ${existente.apellidos}` 
            });
        }

        // Asignar el UID al estudiante
        const { data, error } = await supabase
            .from('students')
            .update({ uid_tarjeta: uidNormalizado })
            .eq('id', studentId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            message: 'UID asignado correctamente',
            estudiante: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar UID' });
    }
};

// Obtener estudiante por UID
const obtenerEstudiantePorUID = async (req, res) => {
    try {
        const { uid } = req.params;
        const uidNormalizado = uid.trim().toUpperCase();

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('uid_tarjeta', uidNormalizado)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
            return res.status(404).json({ error: 'Tarjeta no registrada' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar estudiante' });
    }
};

// Registrar asistencia
const registrarAsistencia = async (req, res) => {
    try {
        const { uid_tarjeta } = req.body;

        if (!uid_tarjeta) {
            return res.status(400).json({ error: 'UID de tarjeta requerido' });
        }

        // Validar que sea día de semana (Lunes a Viernes)
        const fechaActual = getGuatemalaDate();
        const diaSemana = fechaActual.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

        if (diaSemana === 0 || diaSemana === 6) {
            // Primero intentar identificar a quién pertenece la tarjeta
            const uidNormalizado = uid_tarjeta.trim().toUpperCase();
            
            // Buscar estudiante o docente
            const { data: estudiante } = await supabase
                .from('students')
                .select('*')
                .eq('uid_tarjeta', uidNormalizado)
                .single();

            const { data: docente } = await supabase
                .from('teachers')
                .select('*')
                .eq('uid_tarjeta', uidNormalizado)
                .single();

            if (!estudiante && !docente) {
                return res.status(404).json({ 
                    error: 'Tarjeta no registrada',
                    mensaje: 'Esta tarjeta no está asignada a ningún estudiante o docente'
                });
            }

            // Retornar info pero sin registrar
            return res.status(200).json({ 
                tipo: 'fin_de_semana',
                mensaje: 'Fin de semana - No se registran asistencias',
                detalle: 'Las asistencias solo se registran de lunes a viernes',
                tipoPersona: estudiante ? 'estudiante' : 'docente',
                persona: estudiante ? {
                    id: estudiante.id,
                    nombre: estudiante.nombre,
                    apellido: estudiante.apellidos,
                    grado: estudiante.grado,
                    jornada: estudiante.jornada
                } : {
                    id: docente.id,
                    nombre: docente.nombre,
                    jornada: docente.jornada
                }
            });
        }

        const uidNormalizado = uid_tarjeta.trim().toUpperCase();

        // Primero buscar si es un estudiante
        const { data: estudiante, error: errorEst } = await supabase
            .from('students')
            .select('*')
            .eq('uid_tarjeta', uidNormalizado)
            .single();

        // Si no es estudiante, buscar si es docente
        const { data: docente, error: errorDoc } = await supabase
            .from('teachers')
            .select('*')
            .eq('uid_tarjeta', uidNormalizado)
            .single();

        // Si no se encuentra ni estudiante ni docente
        if ((!estudiante || errorEst?.code === 'PGRST116') && (!docente || errorDoc?.code === 'PGRST116')) {
            return res.status(404).json({ 
                error: 'Tarjeta no registrada',
                mensaje: 'Esta tarjeta no está asignada a ningún estudiante o docente'
            });
        }

        const fechaActualStr = fechaActual.toISOString().split('T')[0];
        const horaActual = getGuatemalaDate().toTimeString().split(' ')[0];

        // Si es ESTUDIANTE
        if (estudiante) {
            // Verificar si ya marcó hoy
            const { data: yaMarco } = await supabase
                .from('asistencias')
                .select('*')
                .eq('student_id', estudiante.id)
                .eq('fecha', fechaActualStr)
                .single();

            if (yaMarco) {
                return res.status(400).json({ 
                    error: 'Ya se registró asistencia hoy',
                    tipo: 'estudiante',
                    persona: {
                        id: estudiante.id,
                        nombre: estudiante.nombre,
                        apellido: estudiante.apellidos,
                        grado: estudiante.grado,
                        jornada: estudiante.jornada
                    },
                    asistencia: yaMarco
                });
            }

            // Calcular estado según jornada y hora
            const [horas, minutos] = horaActual.split(':').map(Number);
            const minutosDesdeMedianoche = horas * 60 + minutos;
            
            let estadoAsistencia = 'A_TIEMPO';
            
            if (estudiante.jornada === 'Matutina') {
                // Jornada Matutina: A_TIEMPO ≤ 7:20, TARDE 7:20-7:59, AUSENTE ≥ 8:00
                const limiteATiempo = 7 * 60 + 20; // 7:20 AM = 440 minutos
                const limiteAusente = 8 * 60; // 8:00 AM = 480 minutos
                
                if (minutosDesdeMedianoche <= limiteATiempo) {
                    estadoAsistencia = 'A_TIEMPO';
                } else if (minutosDesdeMedianoche < limiteAusente) {
                    estadoAsistencia = 'TARDE';
                } else {
                    estadoAsistencia = 'AUSENTE';
                }
            } else if (estudiante.jornada === 'Vespertina') {
                // Jornada Vespertina: A_TIEMPO ≤ 13:20, TARDE 13:20-14:00, AUSENTE ≥ 14:00
                const limiteATiempo = 13 * 60 + 20; // 1:20 PM = 800 minutos
                const limiteAusente = 14 * 60; // 2:00 PM = 840 minutos
                
                if (minutosDesdeMedianoche <= limiteATiempo) {
                    estadoAsistencia = 'A_TIEMPO';
                } else if (minutosDesdeMedianoche < limiteAusente) {
                    estadoAsistencia = 'TARDE';
                } else {
                    estadoAsistencia = 'AUSENTE';
                }
            } else if (estudiante.jornada === 'Fin de semana') {
                // Jornada Fin de semana (solo domingos): A_TIEMPO < 7:00, TARDE 7:00-7:59, AUSENTE ≥ 8:00
                const limiteATiempo = 7 * 60; // 7:00 AM = 420 minutos
                const limiteAusente = 8 * 60; // 8:00 AM = 480 minutos
                
                if (minutosDesdeMedianoche < limiteATiempo) {
                    estadoAsistencia = 'A_TIEMPO';
                } else if (minutosDesdeMedianoche < limiteAusente) {
                    estadoAsistencia = 'TARDE';
                } else {
                    estadoAsistencia = 'AUSENTE';
                }
            }

            // Registrar asistencia
            const { data, error } = await supabase
                .from('asistencias')
                .insert({
                    student_id: estudiante.id,
                    uid_tarjeta: uidNormalizado,
                    fecha: fechaActualStr,
                    hora_marcaje: horaActual,
                    fecha_hora_marcaje: getGuatemalaDate().toISOString(),
                    estado_asistencia: estadoAsistencia
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                message: 'Asistencia registrada',
                tipo: 'estudiante',
                persona: {
                    id: estudiante.id,
                    nombre: estudiante.nombre,
                    apellido: estudiante.apellidos,
                    grado: estudiante.grado,
                    jornada: estudiante.jornada
                },
                asistencia: data
            });
        }

        // Si es DOCENTE
        if (docente) {
            // Verificar si ya marcó ENTRADA hoy
            const { data: registroHoy } = await supabase
                .from('teacher_attendance')
                .select('*')
                .eq('teacher_id', docente.id)
                .eq('fecha', fechaActualStr)
                .single();

            // Si NO hay registro de hoy → ENTRADA
            if (!registroHoy) {
                // Calcular estado para DOCENTES según jornada
                const [horas, minutos] = horaActual.split(':').map(Number);
                const minutosDesdeMedianoche = horas * 60 + minutos;
                
                let limite;
                if (docente.jornada === 'Matutina') {
                    limite = 7 * 60; // 7:00 AM en minutos (420 minutos)
                } else if (docente.jornada === 'Vespertina') {
                    limite = 13 * 60 + 10; // 1:10 PM en minutos (790 minutos)
                } else if (docente.jornada === 'Fin de semana') {
                    limite = 6 * 60 + 50; // 6:50 AM en minutos (410 minutos)
                }
                
                let estadoAsistencia = 'A_TIEMPO';
                if (minutosDesdeMedianoche > limite) {
                    estadoAsistencia = 'TARDE';
                }

                // Registrar ENTRADA de docente
                const { data, error } = await supabase
                    .from('teacher_attendance')
                    .insert({
                        teacher_id: docente.id,
                        fecha: fechaActualStr,
                        hora_marcaje: horaActual,
                        fecha_hora_marcaje: getGuatemalaDate().toISOString(),
                        estado: estadoAsistencia
                    })
                    .select()
                    .single();

                if (error) throw error;

                return res.status(201).json({
                    message: 'ENTRADA registrada',
                    tipo: 'docente',
                    accion: 'entrada',
                    persona: {
                        id: docente.id,
                        nombre: docente.nombre,
                        jornada: docente.jornada
                    },
                    asistencia: data
                });
            }

            // Si ya hay registro y YA TIENE SALIDA → Error ya completó su día
            if (registroHoy.hora_salida) {
                return res.status(400).json({ 
                    error: 'Ya completaste tu jornada hoy',
                    mensaje: `Entrada: ${registroHoy.hora_marcaje} | Salida: ${registroHoy.hora_salida}`,
                    tipo: 'docente',
                    persona: {
                        id: docente.id,
                        nombre: docente.nombre,
                        jornada: docente.jornada
                    },
                    asistencia: registroHoy
                });
            }

            // Si hay registro pero SIN SALIDA → MARCAR SALIDA
            // Validación: debe haber pasado al menos 1 hora desde la entrada
            const horaEntrada = new Date(`1970-01-01T${registroHoy.hora_marcaje}`);
            const horaActualDate = new Date(`1970-01-01T${horaActual}`);
            const diferenciaMs = horaActualDate - horaEntrada;
            const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

            if (diferenciaHoras < 1) {
                const minutosRestantes = Math.ceil((1 - diferenciaHoras) * 60);
                return res.status(400).json({ 
                    error: 'Debes permanecer al menos 1 hora en el establecimiento',
                    mensaje: `Faltan ${minutosRestantes} minuto(s) para poder marcar salida`,
                    horaEntrada: registroHoy.hora_marcaje,
                    horaActual: horaActual,
                    tipo: 'docente',
                    persona: {
                        id: docente.id,
                        nombre: docente.nombre,
                        jornada: docente.jornada
                    }
                });
            }

            // Registrar SALIDA
            const { data, error } = await supabase
                .from('teacher_attendance')
                .update({
                    hora_salida: horaActual,
                    fecha_hora_salida: getGuatemalaDate().toISOString()
                })
                .eq('id', registroHoy.id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                message: 'SALIDA registrada correctamente',
                tipo: 'docente',
                accion: 'salida',
                persona: {
                    id: docente.id,
                    nombre: docente.nombre,
                    jornada: docente.jornada
                },
                asistencia: {
                    ...data,
                    tiempoEstadia: `${Math.floor(diferenciaHoras)} hora(s) ${Math.round((diferenciaHoras % 1) * 60)} minuto(s)`
                }
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
};

// Obtener asistencias por fecha
const obtenerAsistencias = async (req, res) => {
    try {
        const { fecha } = req.query;
        const fechaBuscar = fecha || getGuatemalaDateString();

        const { data, error } = await supabase
            .from('asistencias')
            .select(`
                *,
                students (
                    id,
                    nombre,
                    apellidos,
                    grado,
                    jornada,
                    modalidad
                )
            `)
            .eq('fecha', fechaBuscar)
            .order('hora_marcaje', { ascending: true });

        if (error) throw error;

        res.status(200).json(data || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener asistencias' });
    }
};

// Obtener historial de asistencias de un estudiante
const obtenerHistorialEstudiante = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { mes, anio } = req.query;

        let query = supabase
            .from('asistencias')
            .select('*')
            .eq('student_id', studentId);

        if (mes && anio) {
            const fechaInicio = `${anio}-${mes.padStart(2, '0')}-01`;
            const fechaFin = `${anio}-${mes.padStart(2, '0')}-31`;
            query = query.gte('fecha', fechaInicio).lte('fecha', fechaFin);
        }

        const { data, error } = await query.order('fecha', { ascending: false });

        if (error) throw error;

        res.status(200).json(data || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

module.exports = {
  recibirUIDDetectado,
  obtenerUltimoUID,
  asignarUID,
  obtenerEstudiantePorUID,
  registrarAsistencia,
  obtenerAsistencias,
  obtenerHistorialEstudiante
};
