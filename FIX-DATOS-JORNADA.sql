-- =====================================================
-- SOLUCIÓN: Corregir Datos Existentes
-- Basado en que la columna jornada YA EXISTE
-- =====================================================

-- PASO 1: Actualizar estudiantes con jornada NULL
UPDATE students
SET jornada = 'Matutina'
WHERE jornada IS NULL;

-- PASO 2: Corregir valores en minúsculas o con typos
UPDATE students
SET jornada = CASE
    WHEN LOWER(jornada) = 'matutina' THEN 'Matutina'
    WHEN LOWER(jornada) = 'vespertina' THEN 'Vespertina'
    WHEN LOWER(jornada) = 'fin de semana' THEN 'Fin de semana'
    WHEN LOWER(jornada) LIKE '%matu%' THEN 'Matutina'
    WHEN LOWER(jornada) LIKE '%vesp%' THEN 'Vespertina'
    WHEN LOWER(jornada) LIKE '%fin%' THEN 'Fin de semana'
    ELSE 'Matutina'
END
WHERE jornada NOT IN ('Matutina', 'Vespertina', 'Fin de semana')
   OR jornada IS NULL;

-- PASO 3: Verificar que teachers tenga la columna jornada
-- Si no existe, la creamos
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS jornada TEXT DEFAULT 'Matutina';

-- PASO 4: Actualizar docentes con jornada NULL
UPDATE teachers
SET jornada = 'Matutina'
WHERE jornada IS NULL;

-- PASO 5: Verificación final - Todos deben tener jornada válida
SELECT 
    'Students sin jornada válida' as problema,
    COUNT(*) as cantidad
FROM students
WHERE jornada IS NULL 
   OR jornada NOT IN ('Matutina', 'Vespertina', 'Fin de semana')
UNION ALL
SELECT 
    'Teachers sin jornada válida' as problema,
    COUNT(*) as cantidad
FROM teachers
WHERE jornada IS NULL 
   OR jornada NOT IN ('Matutina', 'Vespertina', 'Fin de semana');

-- =====================================================
-- Si el resultado muestra 0 en todas las filas = ✅ TODO BIEN
-- =====================================================
