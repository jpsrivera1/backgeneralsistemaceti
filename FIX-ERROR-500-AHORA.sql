-- =====================================================
-- SOLUCIÓN RÁPIDA PARA ERROR 500 EN ASISTENCIAS
-- Ejecuta esto en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna jornada a students si no existe
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

-- 2. Actualizar registros existentes
UPDATE students 
SET jornada = 'Matutina' 
WHERE jornada IS NULL;

-- 3. Agregar columna jornada a teachers si no existe
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

-- 4. Actualizar registros existentes
UPDATE teachers 
SET jornada = 'Matutina' 
WHERE jornada IS NULL;

-- 5. Verificar que se agregó correctamente
SELECT 
    (SELECT COUNT(*) FROM students WHERE jornada IS NOT NULL) as estudiantes_con_jornada,
    (SELECT COUNT(*) FROM teachers WHERE jornada IS NOT NULL) as docentes_con_jornada;

-- =====================================================
-- EJECUTA ESTO AHORA EN SUPABASE
-- =====================================================
