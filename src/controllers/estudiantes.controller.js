const supabase = require('../config/supabase');

// Obtener todos los estudiantes
const obtenerEstudiantes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener un estudiante por ID
const obtenerEstudiantePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Crear un nuevo estudiante
const crearEstudiante = async (req, res) => {
    try {
        const estudiante = req.body;

        const { data, error } = await supabase
            .from('students')
            .insert([estudiante])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar un estudiante
const actualizarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = req.body;

        const { data, error } = await supabase
            .from('students')
            .update(estudiante)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Eliminar un estudiante
const eliminarEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('students')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({
            success: true,
            message: 'Estudiante eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerEstudiantes,
    obtenerEstudiantePorId,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante
};
