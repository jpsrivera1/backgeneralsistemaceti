-- ============================================
-- Agregar campos de SALIDA a teacher_attendance
-- ============================================

-- Agregar columnas de salida
ALTER TABLE public.teacher_attendance 
ADD COLUMN IF NOT EXISTS hora_salida TIME,
ADD COLUMN IF NOT EXISTS fecha_hora_salida TIMESTAMP;

-- Comentarios
COMMENT ON COLUMN public.teacher_attendance.hora_salida IS 'Hora de salida del docente';
COMMENT ON COLUMN public.teacher_attendance.fecha_hora_salida IS 'Fecha y hora exacta de salida del docente';

-- ============================================
-- Función para cerrar asistencias automáticamente a medianoche
-- ============================================

CREATE OR REPLACE FUNCTION cerrar_asistencias_docentes_automatico()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar registros del día anterior que no tienen hora_salida
    -- Se les asigna salida a las 18:00 horas
    UPDATE public.teacher_attendance
    SET 
        hora_salida = '18:00:00',
        fecha_hora_salida = (fecha || ' 18:00:00')::timestamp
    WHERE 
        fecha = CURRENT_DATE - INTERVAL '1 day'
        AND hora_salida IS NULL;
        
    RAISE NOTICE 'Asistencias cerradas automáticamente para el día anterior';
END;
$$;

COMMENT ON FUNCTION cerrar_asistencias_docentes_automatico IS 'Cierra automáticamente las asistencias de docentes del día anterior que no marcaron salida, asignando hora de salida a las 18:00';

-- ============================================
-- INSTRUCCIONES DE EJECUCIÓN
-- ============================================

-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Configurar un cron job en Supabase para ejecutar la función a medianoche:
--    - Ir a Database → Cron Jobs
--    - Crear nuevo job:
--      * Nombre: "cerrar_asistencias_docentes"
--      * Schedule: "0 0 * * *" (todos los días a medianoche)
--      * SQL: SELECT cerrar_asistencias_docentes_automatico();
