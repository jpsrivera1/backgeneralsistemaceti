# Sistema de Registro de Docentes con Tarjetas NFC

## 📋 Resumen

Se ha implementado un sistema completo de registro de docentes con asignación de tarjetas NFC, integrado con el sistema existente de estudiantes.

## ✅ Componentes Implementados

### Backend (RegEstudiantes)

#### 1. **Controlador de Docentes** (`src/controllers/docentes.controller.js`)
- `registrarDocente` - Crear nuevo docente
- `obtenerDocentes` - Listar docentes con filtros (jornada, estado)
- `obtenerDocentePorId` - Obtener docente específico
- `obtenerDocentePorUID` - Buscar docente por tarjeta NFC
- `asignarUID` - Asignar tarjeta NFC a docente
- `actualizarEstadoDocente` - Cambiar estado (Activo/Inactivo)

#### 2. **Rutas de Docentes** (`src/routes/docentes.routes.js`)
```
POST   /api/docentes              - Registrar docente
GET    /api/docentes              - Obtener todos los docentes
GET    /api/docentes/:id          - Obtener docente por ID
GET    /api/docentes/uid/:uid     - Obtener docente por UID
PUT    /api/docentes/:id/uid      - Asignar UID a docente
PUT    /api/docentes/:id/estado   - Actualizar estado
```

#### 3. **Integración en servidor** (`src/index.js`)
- Agregado endpoint `/api/docentes` en la lista de rutas

### Frontend (FrontRegEstudiantes)

#### 1. **Páginas Nuevas**

**RegistrarDocente.jsx** (`src/pages/RegistrarDocente.jsx`)
- Formulario para registrar nuevos docentes
- Campos: Nombre completo, Jornada (Matutina/Vespertina)
- Validación de datos
- Redirección automática después de registro exitoso

**ListaDocentes.jsx** (`src/pages/ListaDocentes.jsx`)
- Lista completa de docentes
- Filtros por: búsqueda, jornada, estado
- Visualización de tarjeta NFC asignada
- Badges de estado (Activo/Inactivo)
- Iconos diferenciados por jornada (☀️ Matutina, 🌙 Vespertina)

#### 2. **Páginas Modificadas**

**AsignarUID.jsx** (`src/pages/AsignarUID.jsx`)
- ✨ **Nuevo**: Selector de tipo (Estudiante/Docente)
- Búsqueda dinámica según tipo seleccionado
- Detección automática de tarjetas NFC
- Validación cruzada (evita asignar mismo UID a estudiante y docente)
- Lista filtrada por tipo de usuario

**Home.jsx** (`src/pages/Home.jsx`)
- Agregadas 4 tarjetas principales:
  - 🟢 Registrar Estudiante
  - 🔵 Ver Estudiantes
  - 🟠 **Nuevo**: Registrar Docente
  - 🟣 **Nuevo**: Ver Docentes

**Navbar.jsx** (`src/components/Navbar.jsx`)
- Agregado botón "Docentes" en la navegación principal

**App.jsx** (`src/App.jsx`)
- Rutas agregadas:
  - `/docentes/registrar` → RegistrarDocente
  - `/docentes` → ListaDocentes

#### 3. **Servicios API** (`src/services/api.js`)
```javascript
// Funciones agregadas
export const registrarDocente = (data) => ...
export const obtenerDocentes = (params) => ...
export const obtenerDocente = (id) => ...
export const obtenerDocentePorUID = (uid) => ...
export const asignarUIDDocente = (docenteId, uid_tarjeta) => ...
export const actualizarEstadoDocente = (docenteId, estado) => ...
```

### Base de Datos

#### Archivo SQL: `sql-docentes-asistencias.sql`

**Tabla `teachers`:**
- `id` (uuid, PK)
- `nombre` (text, NOT NULL)
- `jornada` (text, CHECK: Matutina/Vespertina)
- `estado` (text, CHECK: Activo/Inactivo, DEFAULT 'Activo')
- `uid_tarjeta` (text, UNIQUE) - **Nuevo campo**
- `created_at` (timestamp)
- UNIQUE constraint en (nombre, jornada)

**Tabla `teacher_attendance`:**
- `id` (uuid, PK)
- `teacher_id` (uuid, FK → teachers)
- `fecha` (date)
- `hora_marcaje` (time)
- `fecha_hora_marcaje` (timestamp)
- `estado` (text, opcional: A_TIEMPO/TARDE)
- `created_at` (timestamp)
- UNIQUE constraint en (teacher_id, fecha)

**Índices creados:**
- `idx_teacher_uid` en teachers(uid_tarjeta)
- `idx_teacher_attendance_date` en teacher_attendance(fecha)
- `idx_teacher_attendance_teacher` en teacher_attendance(teacher_id)

## 🔧 Instrucciones de Instalación

### 1. Base de Datos (Supabase)
```sql
-- Ejecutar en Supabase SQL Editor
-- Copiar y pegar el contenido de sql-docentes-asistencias.sql
```

### 2. Backend
```bash
cd RegEstudiantes
# Ya está configurado, solo reiniciar si está corriendo
npm start
```

### 3. Frontend
```bash
cd FrontRegEstudiantes
npm run dev
```

### 4. Lector NFC (si se va a usar asignación automática)
```bash
cd nodelocal
npm run lector
```

## 🚀 Flujo de Uso

### Registrar un Docente
1. Ir a **Inicio** → Click en "Registrar Docente"
2. Llenar formulario:
   - Nombre completo
   - Jornada (Matutina/Vespertina)
3. Click en "Registrar Docente"
4. Redirección automática a lista de docentes

### Asignar Tarjeta NFC a Docente
1. Ir a **Asignar Tarjetas** en el menú
2. Seleccionar **"Docente"** en el selector de tipo
3. Buscar docente por nombre o jornada
4. Seleccionar docente de la lista
5. **Opción A - Detección Automática:**
   - Esperar mensaje "📡 Escuchando lector NFC..."
   - Acercar tarjeta al lector
   - UID se completa automáticamente
6. **Opción B - Manual:**
   - Escribir UID manualmente
7. Click en "Asignar Tarjeta"

### Ver Lista de Docentes
1. Ir a **Docentes** en el menú
2. Opciones disponibles:
   - Buscar por nombre
   - Filtrar por jornada (Matutina/Vespertina)
   - Filtrar por estado (Activo/Inactivo)
3. Ver docentes con tarjeta asignada (código UID visible)

## 🔄 Validaciones Implementadas

### Backend
- ✅ No se puede registrar un docente con el mismo nombre en la misma jornada
- ✅ El UID de tarjeta debe ser único en toda la tabla `teachers`
- ✅ No se puede asignar un UID que ya está en uso por otro docente
- ✅ No se puede asignar un UID que ya está en uso por un estudiante
- ✅ Normalización automática de UIDs (mayúsculas, sin espacios)

### Frontend
- ✅ Validación de campos obligatorios
- ✅ Selector visual de tipo (Estudiante/Docente)
- ✅ Búsqueda dinámica según tipo seleccionado
- ✅ Indicador visual de tarjeta ya asignada
- ✅ Mensajes de error descriptivos

## 🎨 Características de UI/UX

- **Iconos diferenciados:**
  - 👤 Estudiantes: `bi-person-fill`
  - 🎓 Docentes: `bi-person-badge`
- **Colores en Home:**
  - 🟢 Verde: Registrar Estudiante
  - 🔵 Azul: Ver Estudiantes
  - 🟠 Naranja: Registrar Docente
  - 🟣 Morado: Ver Docentes
- **Jornadas con iconos:**
  - ☀️ Matutina: `bi-sun-fill` (amarillo)
  - 🌙 Vespertina: `bi-moon-fill` (índigo)
- **Estados con badges:**
  - ✅ Activo: Badge verde
  - ❌ Inactivo: Badge gris

## 📊 Estructura de Datos

### Ejemplo de docente en BD:
```json
{
  "id": "uuid-generado",
  "nombre": "Juan Carlos Pérez García",
  "jornada": "Matutina",
  "estado": "Activo",
  "uid_tarjeta": "5F58ECCC",
  "created_at": "2026-01-22T10:30:00Z"
}
```

## 🔐 Seguridad

- ✅ Rutas protegidas con autenticación
- ✅ Validación de entrada en backend
- ✅ Constraints de base de datos (UNIQUE, CHECK, FK)
- ✅ Prevención de duplicados
- ✅ Validación cruzada entre tablas (students y teachers)

## 📝 Notas Técnicas

- **Compatibilidad**: Sistema diseñado para trabajar junto al sistema de estudiantes sin conflictos
- **Escalabilidad**: Arquitectura modular permite agregar más funcionalidades
- **Mantenibilidad**: Código bien organizado con separación de responsabilidades
- **Reusabilidad**: Componentes compartidos (AsignarUID) funcionan para ambos tipos de usuarios

## 🚧 Futuras Mejoras Sugeridas

- [ ] Implementar registro de asistencia de docentes (similar a estudiantes)
- [ ] Agregar página de edición de docentes
- [ ] Dashboard con estadísticas de asistencia de docentes
- [ ] Exportar reportes de asistencia a Excel/PDF
- [ ] Notificaciones automáticas por retardos
- [ ] Histórico de cambios en datos de docentes

## 🐛 Testing Recomendado

1. ✅ Registrar docente duplicado (debe fallar)
2. ✅ Asignar mismo UID a dos docentes (debe fallar)
3. ✅ Asignar UID de estudiante a docente (debe fallar)
4. ✅ Buscar docente por nombre parcial
5. ✅ Filtrar por jornada
6. ✅ Detección automática de tarjeta NFC
7. ✅ Validación de campos vacíos

---

**Desarrollado en:** Enero 2026  
**Stack:** React + Node.js + Express + Supabase PostgreSQL  
**Hardware:** ACR1552U NFC Reader
