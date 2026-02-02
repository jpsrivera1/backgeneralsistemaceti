const supabase = require('../config/supabase');

// Registrar asistencia de docente
const registrarAsistenciaDocente = async (req, res) => {
  try {
    const { docente_id } = req.body;

    if (!docente_id) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ID de docente requerido'
      });
    }

    // Verificar que el docente existe y está activo
    const { data: docente, error: errorDocente } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', docente_id)
      .single();

    if (errorDocente || !docente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Docente no encontrado'
      });
    }

    if (docente.estado !== 'Activo') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El docente no está activo'
      });
    }

    // Obtener fecha y hora de Guatemala
    const guatemalaTime = new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' });
    const fechaHoraGuatemala = new Date(guatemalaTime);
    const fecha = fechaHoraGuatemala.toISOString().split('T')[0];
    const hora = fechaHoraGuatemala.toTimeString().split(' ')[0].substring(0, 5);

    // Verificar si ya registró asistencia hoy
    const { data: asistenciaExistente } = await supabase
      .from('teacher_attendance')
      .select('*')
      .eq('teacher_id', docente_id)
      .eq('fecha', fecha)
      .single();

    if (asistenciaExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El docente ya registró asistencia hoy',
        asistencia: asistenciaExistente
      });
    }

    // Registrar asistencia
    const { data, error } = await supabase
      .from('teacher_attendance')
      .insert([{
        teacher_id: docente_id,
        fecha,
        hora_entrada: hora
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ok: true,
      mensaje: 'Asistencia registrada exitosamente',
      asistencia: data,
      docente: {
        nombre: docente.nombre,
        jornada: docente.jornada
      }
    });
  } catch (error) {
    console.error('Error al registrar asistencia de docente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar asistencia',
      error: error.message
    });
  }
};

// Obtener asistencias de docentes por fecha
const obtenerAsistenciasDocentes = async (req, res) => {
  try {
    const { fecha, jornada } = req.query;

    // Si no se proporciona fecha, usar la fecha actual de Guatemala
    let fechaBusqueda = fecha;
    if (!fechaBusqueda) {
      const guatemalaTime = new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' });
      fechaBusqueda = new Date(guatemalaTime).toISOString().split('T')[0];
    }

    let query = supabase
      .from('teacher_attendance')
      .select(`
        *,
        teachers:teacher_id (
          id,
          nombre,
          jornada,
          estado
        )
      `)
      .eq('fecha', fechaBusqueda)
      .order('hora_entrada', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    // Filtrar por jornada si se especifica
    let asistenciasFiltradas = data || [];
    if (jornada) {
      asistenciasFiltradas = asistenciasFiltradas.filter(a => a.teachers?.jornada === jornada);
    }

    res.json({
      ok: true,
      fecha: fechaBusqueda,
      asistencias: asistenciasFiltradas
    });
  } catch (error) {
    console.error('Error al obtener asistencias de docentes:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener asistencias',
      error: error.message
    });
  }
};

// Obtener reporte de asistencias de un docente
const obtenerReporteDocente = async (req, res) => {
  try {
    const { id } = req.params; // ID del docente viene de la URL
    const { fecha_inicio, fecha_fin } = req.query;

    if (!id) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ID de docente requerido'
      });
    }

    // Obtener información del docente
    const { data: docente, error: errorDocente } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();

    if (errorDocente || !docente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Docente no encontrado'
      });
    }

    // Construir query de asistencias
    let query = supabase
      .from('teacher_attendance')
      .select('*')
      .eq('teacher_id', id)
      .order('fecha', { ascending: false });

    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }

    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }

    const { data: asistencias, error } = await query;

    if (error) throw error;

    // Calcular estadísticas
    const totalDias = asistencias?.length || 0;
    
    res.json({
      ok: true,
      docente: {
        id: docente.id,
        nombre: docente.nombre,
        jornada: docente.jornada,
        estado: docente.estado
      },
      asistencias: asistencias || [],
      resumen: {
        total_dias: totalDias,
        fecha_inicio: fecha_inicio || 'No especificada',
        fecha_fin: fecha_fin || 'No especificada'
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de docente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener reporte',
      error: error.message
    });
  }
};

module.exports = {
  registrarAsistenciaDocente,
  obtenerAsistenciasDocentes,
  obtenerReporteDocente
};
