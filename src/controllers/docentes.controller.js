const supabase = require('../config/supabase');

// Registrar nuevo docente
const registrarDocente = async (req, res) => {
  try {
    const { nombre, jornada } = req.body;

    if (!nombre || !jornada) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre y jornada son requeridos'
      });
    }

    if (!['Matutina', 'Vespertina', 'Fin de semana'].includes(jornada)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Jornada debe ser Matutina, Vespertina o Fin de semana'
      });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert([{ nombre, jornada }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Duplicate
        return res.status(400).json({
          ok: false,
          mensaje: 'Ya existe un docente con ese nombre en esa jornada'
        });
      }
      throw error;
    }

    res.status(201).json({
      ok: true,
      mensaje: 'Docente registrado exitosamente',
      docente: data
    });
  } catch (error) {
    console.error('Error al registrar docente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar docente',
      error: error.message
    });
  }
};

// Obtener todos los docentes
const obtenerDocentes = async (req, res) => {
  try {
    const { jornada, estado } = req.query;

    let query = supabase
      .from('teachers')
      .select('*')
      .order('nombre', { ascending: true });

    if (jornada) {
      query = query.eq('jornada', jornada);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      ok: true,
      docentes: data || []
    });
  } catch (error) {
    console.error('Error al obtener docentes:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener docentes',
      error: error.message
    });
  }
};

// Obtener docente por ID
const obtenerDocentePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          ok: false,
          mensaje: 'Docente no encontrado'
        });
      }
      throw error;
    }

    res.json({
      ok: true,
      docente: data
    });
  } catch (error) {
    console.error('Error al obtener docente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener docente',
      error: error.message
    });
  }
};

// Obtener docente por UID de tarjeta
const obtenerDocentePorUID = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        ok: false,
        mensaje: 'UID requerido'
      });
    }

    const uidNormalizado = uid.toUpperCase().replace(/\s+/g, '');

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('uid_tarjeta', uidNormalizado)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          ok: false,
          mensaje: 'No se encontró docente con ese UID'
        });
      }
      throw error;
    }

    res.json({
      ok: true,
      docente: data
    });
  } catch (error) {
    console.error('Error al obtener docente por UID:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al buscar docente',
      error: error.message
    });
  }
};

// Asignar UID de tarjeta a docente
const asignarUID = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid_tarjeta } = req.body;

    if (!uid_tarjeta) {
      return res.status(400).json({
        ok: false,
        mensaje: 'UID de tarjeta requerido'
      });
    }

    // Normalizar UID
    const uidNormalizado = uid_tarjeta.toUpperCase().replace(/\s+/g, '');

    // Verificar que el UID no esté asignado a otro docente
    const { data: docenteExistente } = await supabase
      .from('teachers')
      .select('id, nombre')
      .eq('uid_tarjeta', uidNormalizado)
      .neq('id', id)
      .single();

    if (docenteExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: `Este UID ya está asignado al docente ${docenteExistente.nombre}`
      });
    }

    // Verificar que el UID no esté asignado a un estudiante
    const { data: estudianteExistente } = await supabase
      .from('students')
      .select('id, nombre, apellido')
      .eq('uid_tarjeta', uidNormalizado)
      .single();

    if (estudianteExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: `Este UID ya está asignado al estudiante ${estudianteExistente.nombre} ${estudianteExistente.apellido}`
      });
    }

    // Asignar UID al docente
    const { data, error } = await supabase
      .from('teachers')
      .update({ uid_tarjeta: uidNormalizado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          ok: false,
          mensaje: 'Docente no encontrado'
        });
      }
      throw error;
    }

    res.json({
      ok: true,
      mensaje: 'UID asignado exitosamente',
      docente: data
    });
  } catch (error) {
    console.error('Error al asignar UID:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al asignar UID',
      error: error.message
    });
  }
};

// Actualizar estado del docente
const actualizarEstadoDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['Activo', 'Inactivo'].includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado debe ser Activo o Inactivo'
      });
    }

    const { data, error } = await supabase
      .from('teachers')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          ok: false,
          mensaje: 'Docente no encontrado'
        });
      }
      throw error;
    }

    res.json({
      ok: true,
      mensaje: 'Estado actualizado exitosamente',
      docente: data
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar estado',
      error: error.message
    });
  }
};

module.exports = {
  registrarDocente,
  obtenerDocentes,
  obtenerDocentePorId,
  obtenerDocentePorUID,
  asignarUID,
  actualizarEstadoDocente
};
