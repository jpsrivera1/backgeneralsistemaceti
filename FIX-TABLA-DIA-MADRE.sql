-- SOLUCIÓN: Corregir tipo de dato de student_id en pago_dia_madre
-- El problema es que student_id debe ser UUID para coincidir con students.id

-- 1. Eliminar la tabla actual (si existe)
DROP TABLE IF EXISTS public.pago_dia_madre CASCADE;

-- 2. Crear la tabla con el tipo de dato correcto (UUID)
CREATE TABLE public.pago_dia_madre (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    monto_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    monto_adelanto NUMERIC(10,2) NOT NULL DEFAULT 0,
    monto_pendiente NUMERIC(10,2) GENERATED ALWAYS AS (monto_total - monto_adelanto) STORED,
    payment_method_id INTEGER REFERENCES public.payment_methods(id),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_dia_madre UNIQUE(student_id)
);

-- 3. Crear índice para mejorar rendimiento
CREATE INDEX idx_pago_dia_madre_student ON public.pago_dia_madre(student_id);

-- 4. Comentarios para documentación
COMMENT ON TABLE public.pago_dia_madre IS 'Tabla de pagos del Día de la Madre';
COMMENT ON COLUMN public.pago_dia_madre.monto_pendiente IS 'Calculado automáticamente como monto_total - monto_adelanto';
