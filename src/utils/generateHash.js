// Script para generar hash de contraseña
// Ejecutar: node src/utils/generateHash.js TU_CONTRASEÑA

const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
    console.log('❌ Uso: node src/utils/generateHash.js TU_CONTRASEÑA');
    console.log('Ejemplo: node src/utils/generateHash.js admin123');
    process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('\n🔐 Generador de Hash de Contraseña');
console.log('================================');
console.log(`Contraseña: ${password}`);
console.log(`Hash SHA256: ${hash}`);
console.log('\n📋 SQL para insertar usuario:');
console.log(`INSERT INTO users (username, password_hash) VALUES ('tu_usuario', '${hash}');`);
console.log('');
