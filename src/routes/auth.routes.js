const express = require('express');
const router = express.Router();
const { login, verificarSesion } = require('../controllers/auth.controller');

// POST - Login
router.post('/login', login);

// POST - Verificar sesión
router.post('/verificar', verificarSesion);

module.exports = router;
