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

## ⚠️ Notas Importantes
- Necesitas proporcionar tu `SUPABASE_URL` y `SUPABASE_KEY` para conectar
- El servidor corre en el puerto 3000 por defecto
- Asegúrate de tener una tabla `estudiantes` en tu base de datos Supabase

---

*Última actualización: 4 de diciembre de 2025*
