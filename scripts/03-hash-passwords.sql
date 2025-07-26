-- Script para crear usuarios con contraseñas hasheadas correctamente
-- Nota: Las contraseñas están hasheadas con bcrypt (admin123)

-- Limpiar usuarios existentes si es necesario
DELETE FROM usuarios WHERE username IN ('admin', 'supervisor1', 'empleado1', 'empleado2');

-- Insertar usuarios con contraseñas hasheadas correctamente
-- Contraseña para todos: admin123
INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol) VALUES
('admin', 'admin@autoparts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador del Sistema', 'admin'),
('supervisor1', 'supervisor@autoparts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan Supervisor', 'supervisor'),
('empleado1', 'empleado1@autoparts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María Empleada', 'empleado'),
('empleado2', 'empleado2@autoparts.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Empleado', 'empleado')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;
