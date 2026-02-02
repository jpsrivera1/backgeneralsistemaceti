-- ============================================
-- Sistema de Registro de Docentes y Asistencias
-- ============================================

-- Tabla de Docentes
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  jornada text NOT NULL CHECK (jornada IN ('Matutina', 'Vespertina')),
  estado text DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
  uid_tarjeta text UNIQUE,  -- UID de la tarjeta NFC asignada
  created_at timestamp DEFAULT now(),
  -- Evita duplicados exactos por nombre + jornada
  UNIQUE (nombre, jornada)
);

-- Tabla de Asistencias de Docentes
CREATE TABLE IF NOT EXISTS public.teacher_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora_marcaje time NOT NULL DEFAULT CURRENT_TIME,
  fecha_hora_marcaje timestamp NOT NULL DEFAULT now(),
  -- Estado opcional para clasificar desde backend (A_TIEMPO/TARDE, etc.)
  estado text CHECK (estado IN ('A_TIEMPO', 'TARDE')),
  created_at timestamp DEFAULT now(),
  -- Una asistencia por docente por día
  UNIQUE (teacher_id, fecha)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_teacher_uid ON public.teachers(uid_tarjeta);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_date ON public.teacher_attendance(fecha);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher ON public.teacher_attendance(teacher_id);

-- Comentarios de documentación
COMMENT ON TABLE public.teachers IS 'Registro de docentes del sistema';
COMMENT ON TABLE public.teacher_attendance IS 'Registro de asistencias de docentes usando tarjetas NFC';
COMMENT ON COLUMN public.teachers.uid_tarjeta IS 'UID único de la tarjeta NFC asignada al docente';
COMMENT ON COLUMN public.teacher_attendance.estado IS 'Estado de la asistencia: A_TIEMPO si llegó antes del horario límite, TARDE si llegó después';
