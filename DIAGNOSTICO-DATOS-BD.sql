-- =====================================================
-- DIAGNÓSTICO: Verificar Datos en Students y Teachers
-- Ejecuta esto en Supabase para encontrar el problema
-- =====================================================

-- 1. Ver estudiantes con jornada NULL o valores raros
SELECT 
    id, 
    nombre, 
    apellidos, 
    grado,
    jornada,
    uid_tarjeta
FROM students
WHERE uid_tarjeta IS NOT NULL
  AND (jornada IS NULL 
       OR jornada NOT IN ('Matutina', 'Vespertina', 'Fin de semana'))
LIMIT 10;

-- 2. Ver todos los valores únicos de jornada en students
SELECT DISTINCT jornada, COUNT(*) as cantidad
FROM students
GROUP BY jornada
ORDER BY cantidad DESC;

-- 3. Ver docentes con jornada NULL o sin columna jornada
SELECT 
    id,
    nombre,
    uid_tarjeta
FROM teachers
WHERE uid_tarjeta IS NOT NULL
LIMIT 5;

-- 4. Verificar si la tabla teachers tiene la columna jornada
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'teachers' 
  AND column_name = 'jornada';

-- 5. Ver las últimas asistencias que fallaron (si hay logs)
SELECT *
FROM asistencias
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- =====================================================
-- Si la Query 1 devuelve filas → Hay estudiantes con jornada NULL o inválida
-- Si la Query 2 muestra valores extraños → Hay valores incorrectos
-- Si la Query 4 no devuelve nada → La tabla teachers NO tiene columna jornada
-- =====================================================
