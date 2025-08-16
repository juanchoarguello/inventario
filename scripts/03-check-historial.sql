-- Verificar que la tabla de historial existe y tiene datos
SELECT 
  h.id,
  h.accion,
  h.tabla_afectada,
  h.registro_id,
  u.nombre as usuario_nombre,
  h.fecha,
  h.direccion_ip
FROM historial_acciones h
LEFT JOIN usuarios u ON h.usuario_id = u.id
ORDER BY h.fecha DESC
LIMIT 20;

-- Contar acciones por tipo
SELECT 
  accion,
  COUNT(*) as cantidad
FROM historial_acciones
GROUP BY accion
ORDER BY cantidad DESC;

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_acciones'
ORDER BY ordinal_position;
