-- Crear tabla de asistencias para docentes
CREATE TABLE IF NOT EXISTS teacher_attendance (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para evitar múltiples registros del mismo docente en el mismo día
    UNIQUE(teacher_id, fecha)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher_id ON teacher_attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_fecha ON teacher_attendance(fecha);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_teacher_fecha ON teacher_attendance(teacher_id, fecha);

-- Comentarios
COMMENT ON TABLE teacher_attendance IS 'Tabla para registrar las asistencias diarias de los docentes';
COMMENT ON COLUMN teacher_attendance.teacher_id IS 'ID del docente que registró asistencia';
COMMENT ON COLUMN teacher_attendance.fecha IS 'Fecha de la asistencia';
COMMENT ON COLUMN teacher_attendance.hora_entrada IS 'Hora de entrada del docente';
