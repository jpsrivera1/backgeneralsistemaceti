# Módulo de Pago de Trajes de Graduandos 

## 📋 Descripción General

Se ha agregado un nuevo módulo completo para gestionar pagos de **trajes de graduación** de estudiantes. Este módulo permite registrar el monto total del traje, recibir adelantos y llevar control de saldos pendientes con generación automática de recibos en PDF.

## ✅ Archivos Modificados

### Backend (RegEstudiantes)
1. **`src/controllers/pagos.controller.js`**
   - ✅ Agregada función `obtenerPagoTraje()` - Obtiene el pago de traje de un estudiante
   - ✅ Agregada función `guardarPagoTraje()` - Registra o actualiza pagos de traje
   - ✅ Exportadas ambas funciones en el `module.exports`

2. **`src/routes/pagos.routes.js`**
   - ✅ Agregada ruta GET `/pagos/traje/:studentId` - Obtener pago de traje
   - ✅ Agregada ruta POST `/pagos/traje/:studentId` - Guardar/actualizar pago de traje

### Frontend (FrontRegEstudiantes)
3. **`src/services/api.js`**
   - ✅ Agregadas funciones `obtenerPagoTraje()` y `guardarPagoTraje()`
   - ✅ Integradas con los endpoints del backend

4. **`src/pages/Pagos.jsx`**
   - ✅ Agregados estados para manejar modal y datos de traje
   - ✅ Implementada lógica para cargar pagos al seleccionar estudiante
   - ✅ Agregadas funciones: `abrirModalTraje()`, `cerrarModalTraje()`, `calcularPendienteTraje()`, `handleGuardarTraje()`, `generarReciboTrajePDF()`
   - ✅ Agregada tarjeta visual morada con icono de traje
   - ✅ Agregado modal completo para registrar pagos

### Base de Datos
5. **`sql-add-pago-traje-graduandos.sql`** (NUEVO ARCHIVO)
   - ✅ Script SQL para crear la tabla `pago_traje_graduandos`
   - ✅ Incluye índices, comentarios y ejemplos de uso

---

## 🔧 Instalación y Configuración

### Paso 1: Crear la tabla en Supabase
Ejecuta el archivo SQL en tu proyecto de Supabase:

```sql
-- Ejecutar: sql-add-pago-traje-graduandos.sql
```

Este script creará:
- Tabla `pago_traje_graduandos` con campos para montos, fechas y relaciones
- Columna calculada `monto_pendiente` (automática)
- Índices para optimizar consultas
- Comentarios descriptivos en cada columna

### Paso 2: Desplegar Backend
```bash
cd RegEstudiantes

# Si usas Git
git add .
git commit -m "feat: agregar módulo de pago trajes graduandos"
git push origin main

# Render.com se desplegará automáticamente
```

### Paso 3: Desplegar Frontend
```bash
cd FrontRegEstudiantes

# Si usas Git
git add .
git commit -m "feat: agregar UI para pagos de trajes"
git push origin main

# O construir localmente
npm run build
```

---

## 📱 Cómo usar el módulo

### 1. **Acceder al módulo**
   - Ve a la página de **Pagos**
   - Busca un estudiante que esté en grado de graduación (ver lista abajo)

### 2. **Visualización de la tarjeta**
   - Si el estudiante aplica para graduación, verás dos tarjetas moradas:
     - **Pago Graduación** (ceremonia, acto)
     - **Pago Traje Graduación** (nuevo módulo) 👔

### 3. **Registrar el pago inicial**
   - Haz clic en la tarjeta **"Pago Traje Graduación"**
   - Ingresa:
     - **Monto Total del Traje**: Ejemplo: Q800.00
     - **Adelanto Inicial**: Ejemplo: Q300.00
     - **Forma de Pago**: Efectivo, Transferencia, etc.
   - Clic en **"Guardar y Generar Recibo"**

### 4. **Registrar abonos posteriores**
   - Si queda saldo pendiente, vuelve a hacer clic en la tarjeta
   - El modal mostrará el **estado actual** (Total, Adelanto, Pendiente)
   - Ingresa el nuevo adelanto
   - Puedes usar botones rápidos: **"Pagar Todo"** o **"50%"**
   - Genera el recibo

### 5. **Visualización de estado**
   - **Tarjeta morada**: Hay saldo pendiente
   - **Tarjeta verde**: Pago completado con marcador ✓ CANCELADO
   - Los montos se actualizan en tiempo real

---

## 🎓 Grados que aplican para traje

El módulo se activa automáticamente para estudiantes en estos grados:

**Diario - Matutina:**
- 9no
- 3ro. Básico

**Diario - Vespertina:**
- 5to. BACH en Diseño
- 5to. BACH en Mecánica
- 5to. BACH en Electricidad

**Fin de Semana:**
- 3ro. Básico
- 2do. Año - Básico por Madurez
- 5to. BACO Comercial
- 6to. PCB en Compu
- BACH por Madurez

**Existentes:**
- 5to BACO
- 6to PCB
- Prepa

---

## 📄 Recibo Generado

El sistema genera un recibo PDF con:
- **Encabezado**: Centro Educativo Tecnológico Innova
- **Número de recibo**: `TRA-2026-XXXXXX`
- **Datos del estudiante**: Nombre, grado, jornada, modalidad
- **Detalle del pago**:
  - Monto total del traje
  - Abono realizado (inicial o adicional)
  - Total adelanto acumulado
  - Saldo pendiente
- **Dos copias**: Original y copia cliente
- **Estado**: Si está cancelado, aparece en verde ¡CANCELADO!

---

## 🔍 Estructura de la Base de Datos

```sql
pago_traje_graduandos
  ├── id (uuid, PK)
  ├── student_id (uuid, FK → students)
  ├── monto_total (numeric)
  ├── monto_adelanto (numeric)
  ├── monto_pendiente (numeric, calculada: monto_total - monto_adelanto)
  ├── payment_method_id (int, FK → payment_methods)
  ├── fecha_actualizacion (timestamp)
  └── created_at (timestamp)
```

---

## 🎨 Características del UI

### Tarjeta Visual
- **Color**: Morado (bg-purple-100, text-purple-700)
- **Icono**: `bi-award` (medalla/premio) 🏆
- **Estados**:
  - Con pendiente: Muestra total, adelanto y pendiente en rojo
  - Sin pendiente: Verde con marcador "✓ CANCELADO"
  - Sin registro: Indica "Sin registro de pago"

### Modal de Pago
- **Header**: Morado con título "Pago Traje Graduación"
- **Formulario**:
  - Modo NUEVO: Pide monto total + adelanto inicial
  - Modo ABONO: Solo pide el nuevo adelanto
- **Resumen visual**: Muestra pendiente calculado en tiempo real
- **Botones rápidos**: "Pagar Todo" y "50%" para facilitar entrada

---

## 🐛 Troubleshooting

### La tarjeta no aparece
- **Causa**: El estudiante no está en un grado de graduación
- **Solución**: Verifica que el grado del estudiante coincida con la lista de grados que aplican

### Error 500 al guardar
- **Causa**: La tabla `pago_traje_graduandos` no existe en la base de datos
- **Solución**: Ejecuta el archivo `sql-add-pago-traje-graduandos.sql` en Supabase

### No se genera el recibo
- **Causa**: Problemas con jsPDF o datos incompletos
- **Solución**: Verifica en la consola del navegador (F12) si hay errores

### El pendiente no se actualiza
- **Causa**: La columna `monto_pendiente` no es GENERATED ALWAYS AS
- **Solución**: Recrea la columna con el script SQL proporcionado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs en Render.com (backend)
3. Confirma que la tabla existe en Supabase
4. Verifica que los grados coincidan exactamente (mayúsculas, puntos, etc.)

---

## ✨ Próximas Mejoras Sugeridas

- [ ] Agregar historial de abonos detallados
- [ ] Permitir descuentos o promociones
- [ ] Enviar recibos por WhatsApp/Email
- [ ] Dashboard de reportes de trajes vendidos
- [ ] Notificaciones cuando falten pagos por completar

---

**Fecha de implementación**: 6 de marzo de 2026
**Versión**: 1.0.0
**Desarrollado por**: GitHub Copilot + Usuario
