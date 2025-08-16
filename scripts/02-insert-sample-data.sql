-- Insertar usuario administrador (contraseña: admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Juan Sebastian Arguello', 'admin@sistema.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'admin'),
('Usuario Demo', 'usuario@sistema.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', 'usuario');

-- Insertar partes de ejemplo
INSERT INTO partes (nombre, descripcion, codigo, categoria, marca, modelo_compatible, stock, stock_minimo, precio, proveedor, ubicacion, usuario_creacion) VALUES 
('Filtro de Aceite', 'Filtro de aceite para motor 1.6L', 'FO-001', 'Motor', 'Bosch', 'Chevrolet Aveo', 25, 5, 15000.00, 'Autopartes Colombia', 'Estante A1', 1),
('Pastillas de Freno Delanteras', 'Pastillas de freno cerámicas', 'PF-002', 'Frenos', 'Brembo', 'Toyota Corolla', 12, 3, 85000.00, 'Frenos Profesionales', 'Estante B2', 1),
('Amortiguador Trasero', 'Amortiguador hidráulico trasero', 'AT-003', 'Suspensión', 'Monroe', 'Nissan Sentra', 8, 2, 120000.00, 'Suspensiones del Valle', 'Estante C1', 1),
('Batería 12V', 'Batería de arranque 12V 60Ah', 'BAT-004', 'Eléctrico', 'MAC', 'Universal', 15, 4, 180000.00, 'Baterías Express', 'Estante D1', 1),
('Kit de Embrague', 'Kit completo de embrague', 'KE-005', 'Transmisión', 'LUK', 'Renault Logan', 6, 1, 350000.00, 'Transmisiones Pro', 'Estante E1', 1);
