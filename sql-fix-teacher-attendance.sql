-- ============================================
-- Corrección: Agregar columna estado a teacher_attendance
-- ============================================

-- Agregar columna estado si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'teacher_attendance' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE public.teacher_attendance 
        ADD COLUMN estado text CHECK (estado IN ('A_TIEMPO', 'TARDE', 'AUSENTE'));
        
        COMMENT ON COLUMN public.teacher_attendance.estado IS 'Estado de asistencia: A_TIEMPO, TARDE o AUSENTE';
        
        RAISE NOTICE 'Columna estado agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna estado ya existe';
    END IF;
END $$;
