# Implementación de Reportes de Docentes

## 📋 Resumen

Se ha implementado un sistema completo de reportes de asistencias para docentes, similar al sistema existente para estudiantes.

## 🆕 Archivos Creados

### Backend (RegEstudiantes)

1. **src/controllers/asistenciasDocentes.controller.js**
   - `registrarAsistenciaDocente`: Registra la hora de entrada de un docente
   - `obtenerAsistenciasDocentes`: Obtiene asistencias por fecha y jornada
   - `obtenerReporteDocente`: Genera reporte de un docente con rango de fechas

2. **src/routes/asistenciasDocentes.routes.js**
   - POST `/api/asistencias-docentes/marcar` - Registrar asistencia
   - GET `/api/asistencias-docentes` - Obtener asistencias por fecha/jornada
   - GET `/api/asistencias-docentes/docente/:id` - Obtener reporte de un docente

3. **sql-teacher-attendance.sql**
   - Script SQL para crear la tabla `teacher_attendance`
   - Incluye índices para optimizar consultas
   - Constraint UNIQUE para evitar duplicados por día

### Frontend (reportes_academicos)

1. **src/pages/ReportesMasivosDocentes.jsx**
   - Componente completo para generar reportes masivos de docentes
   - Filtros por jornada (Matutina/Vespertina)
   - Organización de PDFs por carpetas de jornada
   - Barra de progreso durante la generación
   - Descarga en formato ZIP

## 🔧 Archivos Modificados

### Backend

1. **src/index.js**
   - Agregada ruta `/api/asistencias-docentes`

### Frontend

1. **src/services/api.js**
   - `registrarAsistenciaDocente(docente_id)`
   - `obtenerAsistenciasDocentes(params)`
   - `obtenerReporteDocente(id, params)`

2. **src/App.jsx**
   - Importado componente `ReportesMasivosDocentes`
   - Agregada ruta `/reportes-masivos-docentes`

3. **src/components/Navbar.jsx**
   - Agregado menú "Reportes Docentes" en la sección Reportes

## 📊 Estructura de la Base de Datos

### Tabla: teacher_attendance

```sql
CREATE TABLE teacher_attendance (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, fecha)
);
```

## 🎯 Funcionalidades

### Reportes Masivos de Docentes

1. **Filtros disponibles:**
   - Rango de fechas (inicio y fin)
   - Todos los docentes
   - Por jornada específica (Matutina/Vespertina)

2. **Organización de archivos:**
   ```
   Reportes_Docentes_2026-01-01_a_2026-01-31.zip
   ├── Matutina/
   │   ├── Juan Pérez.pdf
   │   └── María García.pdf
   └── Vespertina/
       ├── Carlos López.pdf
       └── Ana Martínez.pdf
   ```

3. **Contenido del PDF:**
   - Información del docente (nombre, jornada, estado)
   - Período del reporte
   - Tabla con fecha y hora de entrada
   - Resumen con total de días asistidos

4. **Características:**
   - Solo incluye docentes activos
   - Progreso en tiempo real
   - Contador de reportes exitosos/fallidos
   - Manejo de errores individual por docente

## 🚀 Pasos Siguientes

### 1. Ejecutar Script SQL

Debes ejecutar el script SQL en tu base de datos de Supabase:

```bash
# El archivo está en:
RegEstudiantes/sql-teacher-attendance.sql
```

### 2. Reiniciar el Backend

```bash
cd RegEstudiantes
npm run dev
```

### 3. El Frontend ya está actualizado

La aplicación frontend ya tiene todos los cambios integrados.

## 📝 Endpoints API

### Registrar Asistencia de Docente
```http
POST /api/asistencias-docentes/marcar
Content-Type: application/json

{
  "docente_id": 1
}
```

### Obtener Asistencias por Fecha
```http
GET /api/asistencias-docentes?fecha=2026-01-30&jornada=Matutina
```

### Obtener Reporte de Docente
```http
GET /api/asistencias-docentes/docente/1?fecha_inicio=2026-01-01&fecha_fin=2026-01-31
```

## ✅ Validaciones Implementadas

1. **Registro de Asistencia:**
   - Verifica que el docente exista y esté activo
   - Previene múltiples registros en el mismo día
   - Usa zona horaria de Guatemala (GMT-6)

2. **Reportes:**
   - Valida rango de fechas
   - Filtra solo docentes activos
   - Maneja errores por docente individual

## 🎨 Interfaz de Usuario

La página de Reportes Masivos de Docentes incluye:
- 👨‍🏫 Icono distintivo en el encabezado
- 📅 Selectores de fecha con valores por defecto (mes actual)
- 🔍 Filtros por jornada
- 📊 Contador de reportes a generar
- 📈 Barra de progreso durante la generación
- 💾 Descarga automática del archivo ZIP

## 🔐 Seguridad

- Rutas protegidas con autenticación
- Validación de datos en backend
- Prevención de inyección SQL mediante Supabase
- Manejo de errores con mensajes claros

---

**Autor:** Sistema de Control Académico  
**Fecha:** 30 de enero de 2026  
**Versión:** 1.0.0
