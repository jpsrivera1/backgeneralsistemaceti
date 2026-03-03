// Script de diagnóstico para problemas de asistencia
// Ejecuta este archivo con: node diagnostico-asistencia.js

const axios = require('axios');

const API_URL = 'https://backgeneralsistemaceti.onrender.com/api';

async function diagnosticar() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔍 DIAGNÓSTICO DE SISTEMA DE ASISTENCIAS              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1. Verificar conexión con el backend
  console.log('1️⃣  Verificando conexión con el backend...');
  try {
    // Intentar con diferentes endpoints
    const response = await axios.get(`${API_URL}/asistencias/ultimo-uid`, { timeout: 5000 });
    console.log('   ✅ Backend accesible\n');
  } catch (error) {
    if (error.response) {
      // El servidor respondió, aunque sea con error
      console.log('   ✅ Backend accesible (respondió con código', error.response.status, ')\n');
    } else {
      console.log('   ❌ Backend NO accesible');
      console.log('   Error:', error.message);
      console.log('   Código:', error.code);
      console.log('   \n   💡 Verifica que el backend esté ejecutándose en Render.com\n');
      return;
    }
  }

  // 2. Verificar endpoint de último UID
  console.log('2️⃣  Verificando endpoint de último UID...');
  try {
    const response = await axios.get(`${API_URL}/asistencias/ultimo-uid`);
    console.log('   ✅ Endpoint funcionando');
    console.log('   Respuesta:', response.data);
  } catch (error) {
    console.log('   ❌ Error en endpoint');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data);
  }
  console.log('');

  // 3. Probar registro de asistencia con UID de prueba
  console.log('3️⃣  Probando registro de asistencia...');
  console.log('   Usando UID de prueba: "TEST123456"');
  try {
    const response = await axios.post(`${API_URL}/asistencias/marcar`, {
      uid_tarjeta: 'TEST123456'
    });
    console.log('   ✅ Registro exitoso (no debería tener tarjeta registrada)');
    console.log('   Respuesta:', response.data);
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    if (status === 404 && data?.error?.includes('no registrada')) {
      console.log('   ✅ Endpoint funcionando correctamente (tarjeta no registrada)');
    } else if (status === 500) {
      console.log('   ❌ ERROR 500 - Problema en el backend');
      console.log('\n   📋 DETALLES DEL ERROR:');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   Error:', data?.error);
      console.log('   Mensaje:', data?.mensaje);
      console.log('   Detalles:', data?.detalles);
      console.log('   Hint:', data?.hint);
      console.log('   Code:', data?.code);
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n   💡 POSIBLES CAUSAS:');
      if (data?.mensaje?.includes('column') || data?.code === '42703') {
        console.log('   • Falta una columna en la base de datos');
        console.log('   • Solución: Ejecuta las migraciones SQL faltantes');
      } else if (data?.mensaje?.includes('relation') || data?.code === '42P01') {
        console.log('   • Falta una tabla en la base de datos');
        console.log('   • Solución: Crea las tablas necesarias');
      } else if (data?.mensaje?.includes('permission') || data?.code === '42501') {
        console.log('   • Problema de permisos en Supabase');
        console.log('   • Solución: Verifica las políticas de seguridad (RLS)');
      } else {
        console.log('   • Error desconocido en el servidor');
        console.log('   • Revisa los logs del backend en Render.com');
      }
    } else {
      console.log('   ⚠️  Respuesta inesperada');
      console.log('   Status:', status);
      console.log('   Data:', data);
    }
  }
  console.log('');

  // 4. Verificar estructura de respuesta
  console.log('4️⃣  Resumen de diagnóstico:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Si ves ERROR 500 arriba:');
  console.log('   1. Revisa los detalles del error mostrados');
  console.log('   2. Verifica la base de datos en Supabase');
  console.log('   3. Ejecuta las migraciones SQL faltantes');
  console.log('   4. Verifica los logs del backend en Render.com');
  console.log('');
  console.log('   Si todo está ✅:');
  console.log('   • El backend está funcionando correctamente');
  console.log('   • El problema puede ser con un UID específico');
  console.log('   • Verifica que las tarjetas estén registradas');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ DIAGNÓSTICO COMPLETADO                              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

// Ejecutar diagnóstico
diagnosticar().catch(err => {
  console.error('\n❌ Error fatal al ejecutar diagnóstico:', err.message);
  process.exit(1);
});
