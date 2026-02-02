-- ============================================
-- Migración: Agregar campo uid_tarjeta a tabla teachers
-- ============================================
-- Ejecutar este script SOLO si la tabla teachers ya existe
-- y no tiene el campo uid_tarjeta

-- Agregar columna uid_tarjeta si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'teachers' 
        AND column_name = 'uid_tarjeta'
    ) THEN
        ALTER TABLE public.teachers 
        ADD COLUMN uid_tarjeta text UNIQUE;
        
        -- Crear índice para mejorar búsquedas por UID
        CREATE INDEX idx_teacher_uid ON public.teachers(uid_tarjeta);
        
        -- Agregar comentario
        COMMENT ON COLUMN public.teachers.uid_tarjeta IS 'UID único de la tarjeta NFC asignada al docente';
        
        RAISE NOTICE 'Columna uid_tarjeta agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna uid_tarjeta ya existe';
    END IF;
END $$;
