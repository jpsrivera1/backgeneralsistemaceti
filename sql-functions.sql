-- =====================================================
-- FUNCIONES SQL PARA EL DASHBOARD
-- Ejecuta estas funciones en tu consola de Supabase
-- =====================================================

-- 1. Función: Ingresos por día
CREATE OR REPLACE FUNCTION get_income_by_day()
RETURNS TABLE (dia date, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    DATE(fecha) AS dia,
    SUM(monto) AS total_ingresos
  FROM (
    SELECT fecha_actualizacion AS fecha, monto_adelanto AS monto FROM pago_inscripcion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_uniforme
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libros_lectura
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_copias_anuales
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libro_ingles
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_excursion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_especialidad
    UNION ALL
    SELECT created_at, total_pagado FROM pago_colegiaturas
    UNION ALL
    SELECT payment_date, amount FROM course_payments
    UNION ALL
    SELECT created_at, paid_amount FROM graduation_payments
  ) pagos
  GROUP BY dia
  ORDER BY dia DESC;
$$;

-- 2. Función: Ingresos por mes
CREATE OR REPLACE FUNCTION get_income_by_month()
RETURNS TABLE (mes text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    TO_CHAR(fecha, 'YYYY-MM') AS mes,
    SUM(monto) AS total_ingresos
  FROM (
    SELECT fecha_actualizacion AS fecha, monto_adelanto AS monto FROM pago_inscripcion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_uniforme
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libros_lectura
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_copias_anuales
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libro_ingles
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_excursion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_especialidad
    UNION ALL
    SELECT created_at, total_pagado FROM pago_colegiaturas
    UNION ALL
    SELECT payment_date, amount FROM course_payments
    UNION ALL
    SELECT created_at, paid_amount FROM graduation_payments
  ) pagos
  GROUP BY mes
  ORDER BY mes DESC;
$$;

-- 3. Función: Ingresos por tipo de pago
CREATE OR REPLACE FUNCTION get_income_by_type()
RETURNS TABLE (tipo_pago text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT tipo_pago, SUM(monto) AS total_ingresos
  FROM (
    SELECT 'INSCRIPCION' tipo_pago, monto_adelanto monto FROM pago_inscripcion
    UNION ALL
    SELECT 'UNIFORME', monto_adelanto FROM pago_uniforme
    UNION ALL
    SELECT 'LIBROS LECTURA', monto_adelanto FROM pago_libros_lectura
    UNION ALL
    SELECT 'COPIAS ANUALES', monto_adelanto FROM pago_copias_anuales
    UNION ALL
    SELECT 'LIBRO INGLES', monto_adelanto FROM pago_libro_ingles
    UNION ALL
    SELECT 'EXCURSION', monto_adelanto FROM pago_excursion
    UNION ALL
    SELECT 'ESPECIALIDAD', monto_adelanto FROM pago_especialidad
    UNION ALL
    SELECT 'COLEGIATURAS', total_pagado FROM pago_colegiaturas
    UNION ALL
    SELECT 'CURSOS EXTRAS', amount FROM course_payments
    UNION ALL
    SELECT 'GRADUACION', paid_amount FROM graduation_payments
  ) pagos
  GROUP BY tipo_pago
  ORDER BY total_ingresos DESC;
$$;

-- 4. Función: Pagos pendientes
CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (estudiante text, tipo_pago text, monto_pendiente numeric)
LANGUAGE sql
AS $$
  SELECT 
    s.nombre || ' ' || s.apellidos AS estudiante,
    vpe.tipo_pago,
    vpe.monto_pendiente
  FROM vista_pagos_estudiantes vpe
  JOIN students s ON s.id = vpe.student_id
  WHERE vpe.monto_pendiente > 0
  ORDER BY vpe.monto_pendiente DESC;
$$;

-- 5. Función: Total de mora
CREATE OR REPLACE FUNCTION get_total_mora()
RETURNS TABLE (total_mora numeric)
LANGUAGE sql
AS $$
  SELECT SUM(mora) AS total_mora
  FROM pago_colegiaturas;
$$;

-- 6. Función: Ingresos por método de pago
CREATE OR REPLACE FUNCTION get_income_by_payment_method()
RETURNS TABLE (metodo_pago text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    pm.name AS metodo_pago,
    SUM(pagos.monto) AS total_ingresos
  FROM (
    -- INSCRIPCION
    SELECT payment_method_id, monto_adelanto AS monto
    FROM pago_inscripcion

    UNION ALL
    -- UNIFORME
    SELECT payment_method_id, monto_adelanto
    FROM pago_uniforme

    UNION ALL
    -- LIBROS LECTURA
    SELECT payment_method_id, monto_adelanto
    FROM pago_libros_lectura

    UNION ALL
    -- COPIAS ANUALES
    SELECT payment_method_id, monto_adelanto
    FROM pago_copias_anuales

    UNION ALL
    -- LIBRO INGLES
    SELECT payment_method_id, monto_adelanto
    FROM pago_libro_ingles

    UNION ALL
    -- EXCURSION
    SELECT payment_method_id, monto_adelanto
    FROM pago_excursion

    UNION ALL
    -- ESPECIALIDAD
    SELECT payment_method_id, monto_adelanto
    FROM pago_especialidad

    UNION ALL
    -- COLEGIATURAS
    SELECT payment_method_id, total_pagado
    FROM pago_colegiaturas

    UNION ALL
    -- CURSOS EXTRAS
    SELECT payment_method_id, amount
    FROM course_payments

    UNION ALL
    -- GRADUACION
    SELECT payment_method_id, paid_amount
    FROM graduation_payments
  ) pagos
  JOIN payment_methods pm ON pm.id = pagos.payment_method_id
  GROUP BY pm.name
  ORDER BY total_ingresos DESC;
$$;

-- 7. Función: Ingresos mensuales con filtro de fechas
CREATE OR REPLACE FUNCTION get_monthly_income(start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS TABLE (total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    SUM(monto) AS total_ingresos
  FROM (
    SELECT fecha_actualizacion AS fecha, monto_adelanto AS monto FROM pago_inscripcion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_uniforme
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libros_lectura
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_copias_anuales
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_libro_ingles
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_excursion
    UNION ALL
    SELECT fecha_actualizacion, monto_adelanto FROM pago_especialidad
    UNION ALL
    SELECT created_at, total_pagado FROM pago_colegiaturas
    UNION ALL
    SELECT payment_date, amount FROM course_payments
    UNION ALL
    SELECT created_at, paid_amount FROM graduation_payments
  ) pagos
  WHERE (start_date IS NULL OR fecha >= start_date)
    AND (end_date IS NULL OR fecha <= end_date);
$$;

-- =====================================================
-- NOTA: 
-- 1. Ejecuta estas funciones en el SQL Editor de Supabase
-- 2. Asegúrate de que todas las tablas mencionadas existen
-- 3. Si alguna tabla no existe, ajusta las consultas según tu esquema
-- =====================================================