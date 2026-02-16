# 🎓 Sistema de Registro de Estudiantes - Roadmap

## 📋 Estado del Proyecto

### Fase 1: Configuración Inicial (Backend)
- [x] Crear estructura del proyecto
- [x] Crear archivo de guía (ROADMAP.md)
- [x] Inicializar proyecto Node.js ✅
- [x] Instalar dependencias ✅
- [x] Configurar variables de entorno (.env) ✅

### Fase 2: Configuración de Supabase
- [x] Configurar conexión a Supabase (src/config/supabase.js)
- [x] Verificar conexión a la base de datos ✅ *Servidor funcionando*
- [x] Tabla `students` configurada ✅

### Fase 3: Desarrollo del Backend
- [x] Crear servidor Express básico (src/index.js)
- [x] Crear rutas CRUD para estudiantes:
  - [x] GET /api/estudiantes - Obtener todos los estudiantes
  - [x] GET /api/estudiantes/:id - Obtener estudiante por ID
  - [x] POST /api/estudiantes - Crear nuevo estudiante
  - [x] PUT /api/estudiantes/:id - Actualizar estudiante
  - [x] DELETE /api/estudiantes/:id - Eliminar estudiante

### Fase 4: Desarrollo del Frontend (React + Tailwind)
- [x] Crear proyecto React con Vite ✅
- [x] Configurar Tailwind CSS ✅
- [x] Crear componentes:
  - [x] Navbar (navegación)
  - [x] Home (página principal)
  - [x] RegistrarEstudiante (formulario con selectores)
  - [x] ListaEstudiantes (tabla con búsqueda y filtros)
  - [x] EditarEstudiante (edición de datos)
- [x] Configurar servicios API (axios)
- [x] Selectores implementados:
  - [x] Grados: Kinder, Prepa, 1ro-3ro Primaria, 7mo-9no, 4to-5to BACO, 4to-6to PCB
  - [x] Jornadas: Matutina, Vespertina
  - [x] Modalidades: Diario, Fin de semana, Curso extra

### Fase 5: Finalización
- [x] Probar todas las rutas ✅
- [x] Documentar API ✅
- [x] Frontend funcionando ✅

---

## 🛠️ Comandos a Ejecutar

### Paso 1: Inicializar proyecto
```bash
npm init -y
```

### Paso 2: Instalar dependencias
```bash
npm install express @supabase/supabase-js dotenv cors
```

### Paso 3: Configurar .env
Crear archivo `.env` con tus credenciales de Supabase:
```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_anon_key_de_supabase
PORT=3000
```

### Paso 4: Ejecutar el servidor
```bash
node src/index.js
```

---

## 📁 Estructura del Proyecto
```
RegEstudiantes/
├── src/
│   ├── config/
│   │   └── supabase.js      # Configuración de Supabase
│   ├── controllers/
│   │   └── estudiantes.controller.js  # Lógica del CRUD
│   ├── routes/
│   │   └── estudiantes.routes.js      # Rutas de la API
│   └── index.js             # Punto de entrada
├── .env                     # Variables de entorno (crear manualmente)
├── .gitignore
├── package.json
└── ROADMAP.md
```

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/estudiantes | Obtener todos los estudiantes |
| GET | /api/estudiantes/:id | Obtener un estudiante por ID |
| POST | /api/estudiantes | Crear nuevo estudiante |
| PUT | /api/estudiantes/:id | Actualizar estudiante |
| DELETE | /api/estudiantes/:id | Eliminar estudiante |

---

## 🆕 Fase 6: Sistema de Entrada/Salida Docentes (Feb 2026)

### Funcionalidades Implementadas
- [x] **Registro de ENTRADA** (Primera marcada del día)
  - [x] Validación de horario (A_TIEMPO / TARDE)
  - [x] Límites por jornada (Matutina: 7:00 AM, Vespertina: 1:10 PM)
  - [x] Solo una entrada por día

- [x] **Registro de SALIDA** (Segunda marcada del día)
  - [x] Validación de permanencia mínima: 1 hora
  - [x] Bloqueo si no ha pasado 1 hora desde entrada
  - [x] Muestra minutos restantes si intenta salir antes
  - [x] Cálculo de tiempo de estadía

- [x] **Cierre Automático a Medianoche**
  - [x] Función SQL: `cerrar_asistencias_docentes_automatico()`
  - [x] Registra salida a las 18:00 si docente no marcó
  - [x] Se ejecuta automáticamente con Cron Job

- [x] **Modificaciones en Base de Datos**
  - [x] Agregado campo `hora_salida` en `teacher_attendance`
  - [x] Agregado campo `fecha_hora_salida` en `teacher_attendance`
  - [x] Script SQL: `sql-add-salida-docentes.sql`

- [x] **Validaciones Implementadas**
  - [x] No puede marcar salida sin entrada
  - [x] No puede marcar salida antes de 1 hora
  - [x] No puede marcar salida dos veces
  - [x] Mensajes descriptivos para cada caso

### Archivos Creados/Modificados
- ✅ `sql-add-salida-docentes.sql` - Script de migración
- ✅ `DOCUMENTACION-ENTRADA-SALIDA-DOCENTES.md` - Guía completa
- ✅ `src/controllers/asistencias.controller.js` - Lógica entrada/salida

### Endpoints API Docentes
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/asistencias/marcar | Marcar entrada O salida (detección automática) |

### Respuestas del Sistema
- **Entrada registrada** → Status 201
- **Salida registrada** → Status 200
- **Error: Menos de 1 hora** → Status 400 (con minutos restantes)
- **Error: Ya completó jornada** → Status 400

### Configuración Requerida
1. Ejecutar `sql-add-salida-docentes.sql` en Supabase
2. Configurar Cron Job en Supabase:
   ```sql
   SELECT cron.schedule(
       'cerrar-asistencias-docentes',
       '0 0 * * *',
       'SELECT cerrar_asistencias_docentes_automatico();'
   );
   ```
3. Desplegar backend actualizado en Render

---

## ⚠️ Notas Importantes
- Necesitas proporcionar tu `SUPABASE_URL` y `SUPABASE_KEY` para conectar
- El servidor corre en el puerto 3000 por defecto
- Asegúrate de tener una tabla `estudiantes` en tu base de datos Supabase
- **NUEVO:** Configurar Cron Job en Supabase para cierre automático de asistencias

---

*Última actualización: 15 de febrero de 2026*
