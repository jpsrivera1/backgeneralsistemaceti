-- =======================================================
-- FUNCIONES SQL SIMPLIFICADAS PARA SUPABASE
-- Ejecuta estas en el SQL Editor de Supabase
-- =======================================================

-- 1. Función: Obtener ingresos por día (simplificada)
CREATE OR REPLACE FUNCTION get_income_by_day()
RETURNS TABLE (dia date, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    DATE(created_at) AS dia,
    SUM(COALESCE(total_pagado, 0)) AS total_ingresos
  FROM pago_colegiaturas
  WHERE created_at IS NOT NULL
  GROUP BY DATE(created_at)
  ORDER BY dia DESC
  LIMIT 30;
$$;

-- 2. Función: Obtener ingresos por mes (simplificada)
CREATE OR REPLACE FUNCTION get_income_by_month()
RETURNS TABLE (mes text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    TO_CHAR(created_at, 'YYYY-MM') AS mes,
    SUM(COALESCE(total_pagado, 0)) AS total_ingresos
  FROM pago_colegiaturas
  WHERE created_at IS NOT NULL
  GROUP BY TO_CHAR(created_at, 'YYYY-MM')
  ORDER BY mes DESC
  LIMIT 12;
$$;

-- 3. Función: Obtener ingresos por tipo de pago (simplificada)
CREATE OR REPLACE FUNCTION get_income_by_type()
RETURNS TABLE (tipo_pago text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    'COLEGIATURAS' as tipo_pago,
    SUM(COALESCE(total_pagado, 0)) AS total_ingresos
  FROM pago_colegiaturas
  WHERE total_pagado IS NOT NULL AND total_pagado > 0;
$$;

-- 4. Función: Obtener total de mora (simplificada)
CREATE OR REPLACE FUNCTION get_total_mora()
RETURNS TABLE (total_mora numeric)
LANGUAGE sql
AS $$
  SELECT SUM(COALESCE(mora, 0)) AS total_mora
  FROM pago_colegiaturas;
$$;

-- 5. Función: Obtener ingresos por método de pago (simplificada)
CREATE OR REPLACE FUNCTION get_income_by_payment_method()
RETURNS TABLE (metodo_pago text, total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    COALESCE(pm.name, 'Sin especificar') AS metodo_pago,
    SUM(COALESCE(pc.total_pagado, 0)) AS total_ingresos
  FROM pago_colegiaturas pc
  LEFT JOIN payment_methods pm ON pm.id = pc.payment_method_id
  WHERE pc.total_pagado IS NOT NULL AND pc.total_pagado > 0
  GROUP BY pm.name
  ORDER BY total_ingresos DESC;
$$;

-- 6. Función: Obtener ingresos mensuales con filtro (simplificada)
CREATE OR REPLACE FUNCTION get_monthly_income(start_date date DEFAULT NULL, end_date date DEFAULT NULL)
RETURNS TABLE (total_ingresos numeric)
LANGUAGE sql
AS $$
  SELECT 
    SUM(COALESCE(total_pagado, 0)) AS total_ingresos
  FROM pago_colegiaturas
  WHERE (start_date IS NULL OR DATE(created_at) >= start_date)
    AND (end_date IS NULL OR DATE(created_at) <= end_date);
$$;

-- 7. Función: Obtener pagos pendientes (si existe la vista, sino crear datos básicos)
CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (estudiante text, tipo_pago text, monto_pendiente numeric)
LANGUAGE sql
AS $$
  SELECT 
    'Estudiante ' || s.id::text AS estudiante,
    'COLEGIATURA' AS tipo_pago,
    COALESCE(pc.monto_pendiente, 0) AS monto_pendiente
  FROM students s
  LEFT JOIN pago_colegiaturas pc ON pc.student_id = s.id
  WHERE COALESCE(pc.monto_pendiente, 0) > 0
  ORDER BY monto_pendiente DESC
  LIMIT 10;
$$;

-- =======================================================
-- INSTRUCCIONES:
-- 1. Ejecuta estas funciones una por una en Supabase SQL Editor
-- 2. Si alguna falla, ajusta según las columnas de tus tablas
-- 3. Luego inicia el backend
-- =======================================================