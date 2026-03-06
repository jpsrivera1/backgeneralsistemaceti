-- =====================================================
-- CREAR TABLA: pago_traje_graduandos
-- Tabla para gestionar pagos de trajes de graduación
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pago_traje_graduandos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relación con estudiante
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  
  -- Montos
  monto_total numeric(10,2) NOT NULL,
  monto_adelanto numeric(10,2) DEFAULT 0,
  monto_pendiente numeric(10,2) GENERATED ALWAYS AS (monto_total - monto_adelanto) STORED,
  
  -- Método de pago
  payment_method_id INT REFERENCES public.payment_methods(id),
  
  -- Fechas
  fecha_actualizacion timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- =====================================================
-- COMENTARIOS EN LA TABLA
-- =====================================================

COMMENT ON TABLE public.pago_traje_graduandos IS 'Tabla para gestionar pagos de trajes de graduación de estudiantes';
COMMENT ON COLUMN public.pago_traje_graduandos.student_id IS 'ID del estudiante que está comprando el traje';
COMMENT ON COLUMN public.pago_traje_graduandos.monto_total IS 'Monto total del traje de graduación';
COMMENT ON COLUMN public.pago_traje_graduandos.monto_adelanto IS 'Suma de todos los adelantos/abonos realizados';
COMMENT ON COLUMN public.pago_traje_graduandos.monto_pendiente IS 'Monto que falta por pagar (calculado automáticamente)';
COMMENT ON COLUMN public.pago_traje_graduandos.payment_method_id IS 'Método de pago utilizado en el último abono';
COMMENT ON COLUMN public.pago_traje_graduandos.fecha_actualizacion IS 'Fecha del último abono o actualización';
COMMENT ON COLUMN public.pago_traje_graduandos.created_at IS 'Fecha de creación del registro inicial';

-- =====================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pago_traje_student 
ON public.pago_traje_graduandos(student_id);

CREATE INDEX IF NOT EXISTS idx_pago_traje_pendiente 
ON public.pago_traje_graduandos(monto_pendiente);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pago_traje_graduandos'
ORDER BY ordinal_position;

-- =====================================================
-- EJEMPLO DE USO
-- =====================================================

-- Insertar un nuevo pago de traje (ejemplo)
-- INSERT INTO public.pago_traje_graduandos (student_id, monto_total, monto_adelanto, payment_method_id)
-- VALUES ('uuid-del-estudiante', 800.00, 300.00, 1);

-- Actualizar un adelanto existente (agregar nuevo abono de Q200)
-- UPDATE public.pago_traje_graduandos
-- SET 
--   monto_adelanto = monto_adelanto + 200.00,
--   fecha_actualizacion = now(),
--   payment_method_id = 1
-- WHERE student_id = 'uuid-del-estudiante';

-- =====================================================
-- NOTAS IMPORTANTES:
-- - El campo monto_pendiente se calcula automáticamente
-- - Para agregar un abono, sumar al monto_adelanto existente
-- - El sistema verifica que solo estudiantes con grados
--   de graduación puedan tener registros en esta tabla
-- =====================================================
