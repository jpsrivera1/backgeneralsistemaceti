# 🚨 SOLUCIÓN: Error 500 al Registrar Asistencias

## Error Mostrado
```
POST https://backgeneralsistemaceti.onrender.com/api/asistencias/marcar
Error: 500 (Internal Server Error)
AxiosError: Request failed with status code 500
```

---

## 🔍 DIAGNÓSTICO DEL PROBLEMA

El error 500 significa que hay un problema en el backend (servidor). Las causas más comunes son:

1. **Falta una columna en la base de datos** (ej: `jornada`)
2. **Problema de permisos en Supabase** (RLS - Row Level Security)
3. **Tabla o índice faltante en la base de datos**
4. **Error en los datos enviados** (formato incorrecto)

---

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ Ver el Error Detallado en el Frontend

He actualizado el código para que muestre más detalles del error. Ahora cuando ocurra el error 500:

1. Abre la consola del navegador (F12)
2. Busca los mensajes de error
3. Busca específicamente: **"Error 500 - Detalles:"**
4. Copia ese mensaje completo

### 2️⃣ Ejecutar Script de Diagnóstico

He creado un script que prueba el backend:

```powershell
# En la carpeta RegEstudiantes
cd C:\Users\JoseP\OneDrive\Desktop\RegEstudiantes
node diagnostico-asistencia.js
```

Este script te dirá exactamente qué está fallando.

### 3️⃣ Verificar la Base de Datos (Supabase)

1. Ve a https://supabase.com/
2. Entra a tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo: `sql-verificar-estructura.sql`
5. Copia y pega el contenido en el editor SQL
6. Ejecuta cada sección por separado

**Especialmente verifica que existan estas columnas:**

En tabla `students`:
- `id`
- `nombre`
- `apellidos`
- `grado`
- `jornada` ⭐ **IMPORTANTE**
- `uid_tarjeta`

En tabla `asistencias`:
- `id`
- `student_id`
- `uid_tarjeta`
- `fecha`
- `hora_marcaje`
- `fecha_hora_marcaje`
- `estado_asistencia`

En tabla `teachers`:
- `id`
- `nombre`
- `jornada` ⭐ **IMPORTANTE**
- `uid_tarjeta`

### 4️⃣ Si Falta la Columna `jornada`

Si el diagnóstico muestra que falta la columna `jornada`, ejecuta esto en Supabase:

```sql
-- Para students
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

UPDATE students 
SET jornada = 'Matutina' 
WHERE jornada IS NULL;

-- Para teachers
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

UPDATE teachers 
SET jornada = 'Matutina' 
WHERE jornada IS NULL;
```

### 5️⃣ Verificar Políticas de Seguridad (RLS)

En Supabase:

1. Ve a **Authentication** → **Policies**
2. Para cada tabla (`students`, `asistencias`, `teachers`, `teacher_attendance`):
   - Asegúrate de tener políticas de **SELECT**, **INSERT**, **UPDATE**
   - O desactiva temporalmente RLS para probar

**Para desactivar RLS temporalmente:**
```sql
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance DISABLE ROW LEVEL SECURITY;
```

⚠️ **IMPORTANTE:** Después de solucionar el problema, vuelve a activar RLS y configura las políticas correctamente.

### 6️⃣ Revisar Logs del Backend

Si el problema persiste:

1. Ve a https://render.com/ (o donde tengas el backend)
2. Entra al proyecto
3. Ve a **Logs**
4. Busca el error 500 cuando intentas registrar asistencia
5. Copia el error completo

---

## 🔧 POSIBLES ERRORES ESPECÍFICOS

### Error: "column students.jornada does not exist"

**Solución:**
```sql
ALTER TABLE students ADD COLUMN jornada TEXT DEFAULT 'Matutina';
```

### Error: "column teachers.jornada does not exist"

**Solución:**
```sql
ALTER TABLE teachers ADD COLUMN jornada TEXT DEFAULT 'Matutina';
```

### Error: "permission denied for table students"

**Solución:** Verifica las políticas de RLS o desactiva temporalmente RLS.

### Error: "null value in column violates not-null constraint"

**Solución:** Algún campo requerido está vacío. Verifica los datos enviados.

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Ejecuté `node diagnostico-asistencia.js`
- [ ] Verifiqué que existe la columna `jornada` en `students`
- [ ] Verifiqué que existe la columna `jornada` en `teachers`
- [ ] Verifiqué las políticas de RLS en Supabase
- [ ] Revisé los logs del backend en Render.com
- [ ] Verifiqué que los estudiantes tienen `uid_tarjeta` asignado
- [ ] Probé con un UID conocido que exista en la base de datos

---

## 🆘 SI NADA FUNCIONA

1. Envíame la captura de pantalla del resultado de `node diagnostico-asistencia.js`
2. Envíame la captura de los logs del backend (Render.com)
3. Envíame el error completo de la consola del navegador
4. Envíame el resultado de ejecutar las queries de verificación en Supabase

---

## 🎯 RESUMEN RÁPIDO

```powershell
# 1. Diagnosticar
cd C:\Users\JoseP\OneDrive\Desktop\RegEstudiantes
node diagnostico-asistencia.js

# 2. Si falta columna jornada, ejecutar en Supabase:
ALTER TABLE students ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

# 3. Probar de nuevo en el navegador
```

---

**✨ Centro Educativo Tecnológico Innova**
