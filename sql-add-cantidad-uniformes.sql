-- Agregar columna cantidad a la tabla student_uniform_sizes
-- Esta columna permitirá registrar cuántas prendas de cada tipo necesita el estudiante
-- El valor por defecto es 1, lo que significa que todos los registros existentes quedarán con cantidad 1

ALTER TABLE student_uniform_sizes
ADD COLUMN cantidad INT NOT NULL DEFAULT 1;

-- Verificar que la columna se haya agregado correctamente
-- (Puedes ejecutar este SELECT después del ALTER TABLE)
-- SELECT * FROM student_uniform_sizes LIMIT 5;
