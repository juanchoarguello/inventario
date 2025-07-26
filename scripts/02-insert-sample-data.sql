-- Insertar usuarios con contraseñas hasheadas
-- Contraseña para todos: admin123
INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol) VALUES
('admin', 'admin@autopartes.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador del Sistema', 'admin'),
('supervisor1', 'supervisor@autopartes.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan Supervisor', 'supervisor'),
('empleado1', 'empleado1@autopartes.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María Empleada', 'empleado'),
('empleado2', 'empleado2@autopartes.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Empleado', 'empleado')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  nombre_completo = EXCLUDED.nombre_completo,
  rol = EXCLUDED.rol;

-- Insertar partes de ejemplo
INSERT INTO partes (codigo, nombre, categoria, marca, modelo_compatible, precio, stock, stock_minimo, ubicacion, proveedor, usuario_creacion) VALUES
('ALT001', 'Alternador 12V 90A', 'electrica', 'Bosch', 'Toyota Corolla 2015-2020, Honda Civic 2016-2021', 250.00, 15, 5, 'A-1-3', 'AutoPartes SA', 1),
('BAT001', 'Batería 12V 60Ah', 'electrica', 'Varta', 'Universal - Autos compactos', 120.00, 8, 10, 'B-2-1', 'Baterías del Norte', 1),
('MOT001', 'Filtro de Aceite', 'motor', 'Mann', 'Honda Civic 2016-2021, Nissan Sentra 2017-2022', 25.00, 45, 20, 'C-1-2', 'Filtros Premium', 1),
('MOT002', 'Bomba de Agua', 'motor', 'Gates', 'Nissan Sentra 2017-2022, Toyota Yaris 2018-2023', 85.00, 3, 8, 'C-3-1', 'Repuestos Martínez', 1),
('ELE001', 'Sensor de Oxígeno', 'electrica', 'NGK', 'Ford Focus 2018-2023, Chevrolet Cruze 2019-2024', 95.00, 12, 6, 'A-2-4', 'Sensores Pro', 1),
('FRE001', 'Pastillas de Freno Delanteras', 'frenos', 'Brembo', 'Toyota Corolla 2015-2020, Honda Accord 2018-2023', 65.00, 20, 10, 'D-1-1', 'Frenos Seguros', 1),
('SUS001', 'Amortiguador Delantero', 'suspension', 'Monroe', 'Nissan Sentra 2017-2022, Hyundai Elantra 2017-2021', 120.00, 8, 4, 'E-1-2', 'Suspensiones Pro', 1),
('MOT003', 'Bujías de Encendido (Set 4)', 'motor', 'NGK', 'Toyota Corolla 2015-2020, Honda Civic 2016-2021', 45.00, 25, 15, 'C-2-1', 'Bujías Premium', 1),
('ELE002', 'Faro Delantero LED', 'electrica', 'Philips', 'Ford Focus 2018-2023, Chevrolet Cruze 2019-2024', 180.00, 6, 4, 'A-3-2', 'Iluminación Pro', 1),
('FRE002', 'Discos de Freno Delanteros', 'frenos', 'Brembo', 'Nissan Sentra 2017-2022, Hyundai Elantra 2017-2021', 95.00, 12, 8, 'D-1-2', 'Frenos Seguros', 1)
ON CONFLICT (codigo) DO NOTHING;
