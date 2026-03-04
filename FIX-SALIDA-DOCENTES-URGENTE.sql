-- =====================================================
-- FIX URGENTE: Error al Marcar SALIDA de Docentes
-- El problema: Faltan columnas en teacher_attendance
-- =====================================================

-- PASO 1: Agregar las columnas de salida si no existen
ALTER TABLE teacher_attendance 
ADD COLUMN IF NOT EXISTS hora_salida TIME;

ALTER TABLE teacher_attendance 
ADD COLUMN IF NOT EXISTS fecha_hora_salida TIMESTAMPTZ;

-- PASO 2: Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'teacher_attendance' 
  AND column_name IN ('hora_salida', 'fecha_hora_salida');

-- =====================================================
-- RESULTADO ESPERADO: Debe mostrar 2 filas
-- =====================================================
-- column_name          | data_type
-- ---------------------+--------------
-- hora_salida          | time without time zone
-- fecha_hora_salida    | timestamp with time zone
-- =====================================================

-- PASO 3: (Opcional) Ver registros actuales sin salida
SELECT 
    id,
    teacher_id,
    fecha,
    hora_marcaje,
    hora_salida,
    estado
FROM teacher_attendance
WHERE fecha = CURRENT_DATE
ORDER BY hora_marcaje DESC;

-- =====================================================
-- EJECUTAR EN SUPABASE AHORA MISMO
-- =====================================================
