const supabase = require('../config/supabase');
const crypto = require('crypto');

// Función para hashear contraseña
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Login de usuario
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Intento de login:', { username, password: '****' });

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        // Buscar usuario
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        console.log('Usuario encontrado:', data);
        console.log('Error de Supabase:', error);

        if (error || !data) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Verificar contraseña
        const passwordHash = hashPassword(password);
        console.log('Hash generado:', passwordHash);
        console.log('Hash en BD:', data.password_hash);

        if (data.password_hash !== passwordHash) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Login exitoso
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: data.id,
                username: data.username
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Verificar sesión (para validar si el usuario sigue autenticado)
const verificarSesion = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, username')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Sesión inválida' });
        }

        res.status(200).json({
            success: true,
            user: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    login,
    verificarSesion,
    hashPassword
};
