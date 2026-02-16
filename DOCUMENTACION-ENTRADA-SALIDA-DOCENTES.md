# 🕐 Sistema de Entrada/Salida Docentes

## ✨ Funcionalidades Implementadas

### 1. Registro de ENTRADA (Primera marcada del día)
- ✅ **Validaciones:**
  - Se registra fecha, hora de entrada
  - Calcula si llegó A_TIEMPO o TARDE según jornada
  - Matutina: límite 7:00 AM
  - Vespertina: límite 1:10 PM

### 2. Registro de SALIDA (Segunda marcada del día)
- ✅ **Validaciones:**
  - **BLOQUEO 1 HORA**: Debe permanecer mínimo 1 hora en el establecimiento
    - Si no ha pasado 1 hora → Error con minutos restantes
  - Solo puede marcar salida una vez
  - Se registra hora_salida y fecha_hora_salida

### 3. Cierre Automático a Medianoche
- ✅ **Automatización:**
  - A las 00:00 horas se ejecuta función automática
  - Busca registros del día anterior sin salida marcada
  - Les asigna salida automática a las 18:00 horas

---

## 📋 Pasos para Activar el Sistema

### PASO 1: Ejecutar SQL en Supabase

1. Ir a **Supabase Dashboard** → Tu Proyecto
2. Ir a **SQL Editor**
3. Abrir el archivo: `sql-add-salida-docentes.sql`
4. Copiar todo el contenido
5. Pegar en el SQL Editor
6. **Ejecutar** (botón RUN o Ctrl+Enter)

Esto crea:
- ✅ Columnas `hora_salida` y `fecha_hora_salida`
- ✅ Función `cerrar_asistencias_docentes_automatico()`

---

### PASO 2: Configurar Cron Job (Tarea Programada)

#### Opción A: Con pg_cron en Supabase (Recomendado)

1. En Supabase Dashboard, ir a **Database** → **Database** (menú izquierdo)
2. Buscar sección **"Cron Jobs"** o **"Extensions"**
3. Si no está habilitado, habilitar extensión `pg_cron`:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

4. Crear el cron job ejecutando en SQL Editor:
   ```sql
   -- Ejecutar función a medianoche todos los días
   SELECT cron.schedule(
       'cerrar-asistencias-docentes',  -- Nombre del job
       '0 0 * * *',                     -- A las 00:00 todos los días
       'SELECT cerrar_asistencias_docentes_automatico();'
   );
   ```

5. Verificar que se creó:
   ```sql
   SELECT * FROM cron.job;
   ```

#### Opción B: Con Supabase Edge Functions (Si pg_cron no está disponible)

Si tu plan de Supabase no incluye pg_cron, puedes usar un servicio externo como:
- **Cron-job.org** (gratuito)
- **EasyCron**
- Un servidor con crontab

Configurar para llamar a un endpoint que ejecute:
```javascript
POST https://tu-backend.com/api/docentes/cerrar-asistencias
```

---

### PASO 3: Desplegar Backend Actualizado

1. **Hacer commit y push** del código:
   ```bash
   cd RegEstudiantes
   git add .
   git commit -m "feat: Sistema entrada/salida docentes con cierre automático"
   git push origin main
   ```

2. **Render.com** detectará los cambios y hará deploy automático

---

## 🧪 Cómo Probar el Sistema

### Probar ENTRADA
1. Docente acerca su tarjeta NFC al lector
2. Sistema detecta:
   - No hay registro hoy → Marca **ENTRADA**
   - Respuesta: "ENTRADA registrada"
   - Muestra hora de entrada y estado (A_TIEMPO/TARDE)

### Probar SALIDA (Antes de 1 hora)
1. Docente intenta marcar salida inmediatamente
2. Sistema responde:
   - ❌ "Debes permanecer al menos 1 hora"
   - Muestra minutos restantes

### Probar SALIDA (Después de 1 hora)
1. Esperar 1 hora después de la entrada
2. Docente acerca tarjeta nuevamente
3. Sistema detecta:
   - Ya hay entrada hoy
   - Pasó más de 1 hora
   - Marca **SALIDA**
4. Respuesta: "SALIDA registrada correctamente"
   - Muestra tiempo de estadía

### Probar Cierre Automático
1. Un docente marca solo entrada (sin salida)
2. Esperar hasta medianoche (00:00)
3. El cron job ejecuta automáticamente
4. Verificar en la base de datos:
   ```sql
   SELECT * FROM teacher_attendance 
   WHERE fecha = CURRENT_DATE - 1
   AND hora_salida = '18:00:00';
   ```
5. Los registros sin salida ahora tienen `hora_salida = 18:00:00`

---

## 🔧 Mantenimiento

### Ver registros de asistencias
```sql
SELECT 
    ta.*,
    t.nombre,
    t.jornada,
    EXTRACT(EPOCH FROM (hora_salida::time - hora_marcaje::time)) / 3600 as horas_trabajadas
FROM teacher_attendance ta
JOIN teachers t ON t.id = ta.teacher_id
WHERE ta.fecha = CURRENT_DATE
ORDER BY ta.fecha_hora_marcaje DESC;
```

### Ver docentes que no marcaron salida hoy
```sql
SELECT 
    t.nombre,
    t.jornada,
    ta.hora_marcaje,
    ta.estado
FROM teacher_attendance ta
JOIN teachers t ON t.id = ta.teacher_id
WHERE ta.fecha = CURRENT_DATE
AND ta.hora_salida IS NULL;
```

### Verificar ejecuciones del cron job
```sql
SELECT * 
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cerrar-asistencias-docentes')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 📊 Respuestas del Sistema

### Entrada Exitosa
```json
{
  "message": "ENTRADA registrada",
  "tipo": "docente",
  "accion": "entrada",
  "persona": {
    "id": "...",
    "nombre": "Juan Pérez",
    "jornada": "Matutina"
  },
  "asistencia": {
    "fecha": "2026-02-15",
    "hora_marcaje": "07:15:00",
    "estado": "TARDE"
  }
}
```

### Error: Intento salida antes de 1 hora
```json
{
  "error": "Debes permanecer al menos 1 hora en el establecimiento",
  "mensaje": "Faltan 35 minuto(s) para poder marcar salida",
  "horaEntrada": "07:15:00",
  "horaActual": "07:40:00",
  "tipo": "docente"
}
```

### Salida Exitosa
```json
{
  "message": "SALIDA registrada correctamente",
  "tipo": "docente",
  "accion": "salida",
  "persona": {
    "id": "...",
    "nombre": "Juan Pérez",
    "jornada": "Matutina"
  },
  "asistencia": {
    "hora_marcaje": "07:15:00",
    "hora_salida": "12:30:00",
    "tiempoEstadia": "5 hora(s) 15 minuto(s)"
  }
}
```

### Error: Ya completó su jornada
```json
{
  "error": "Ya completaste tu jornada hoy",
  "mensaje": "Entrada: 07:15:00 | Salida: 12:30:00",
  "tipo": "docente"
}
```

---

## ⚙️ Variables Configurables

Si necesitas ajustar las validaciones, edita en `asistencias.controller.js`:

```javascript
// Cambiar límites de hora para A_TIEMPO/TARDE
if (docente.jornada === 'Matutina') {
    limite = 7 * 60;  // 7:00 AM ← CAMBIAR AQUÍ
} else if (docente.jornada === 'Vespertina') {
    limite = 13 * 60 + 10;  // 1:10 PM ← CAMBIAR AQUÍ
}

// Cambiar tiempo mínimo de estadía (actualmente 1 hora)
if (diferenciaHoras < 1) {  // ← CAMBIAR NÚMERO
    // ...
}
```

Si necesitas cambiar la hora de cierre automático, edita en `sql-add-salida-docentes.sql`:

```sql
UPDATE public.teacher_attendance
SET 
    hora_salida = '18:00:00',  -- ← CAMBIAR HORA
    fecha_hora_salida = (fecha || ' 18:00:00')::timestamp
```

---

## 🆘 Solución de Problemas

### Problema: Cron job no se ejecuta
**Solución:**
1. Verificar que pg_cron está instalado:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
2. Verificar que el job existe:
   ```sql
   SELECT * FROM cron.job;
   ```
3. Ver errores:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```

### Problema: No permite marcar salida
**Solución:**
- Verificar que pasó al menos 1 hora desde entrada
- Ver mensaje de error (indica minutos restantes)
- Revisar el log con `hora_marcaje` vs `hora_salida`

### Problema: Salida no se registra
**Solución:**
1. Verificar que el campo `hora_salida` existe en la tabla:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'teacher_attendance';
   ```
2. Si no existe, ejecutar nuevamente el script SQL

---

## 📅 Historial de Cambios

**v2.0 - Sistema Entrada/Salida** (15 Feb 2026)
- ✅ Agregado registro de salida
- ✅ Validación de 1 hora mínima
- ✅ Cierre automático a medianoche (18:00)
- ✅ Mensajes descriptivos para cada acción

**v1.0 - Sistema Básico** (5 Feb 2026)
- ✅ Registro de entrada con estado A_TIEMPO/TARDE
- ✅ Asignación de tarjetas NFC
