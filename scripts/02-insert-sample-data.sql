-- Insertar datos de ejemplo para el sistema de inventario

-- Insertar usuarios (contraseñas hasheadas para 'admin123')
INSERT INTO usuarios (username, password_hash, nombre_completo, email, rol) VALUES
('admin', '$2b$10$8K1p/a0dclxKONwIgdiFhONyx2WjZLvZs5CrT4StqjqNdsiTMBvyW', 'Administrador Principal', 'admin@empresa.com', 'admin'),
('supervisor1', '$2b$10$8K1p/a0dclxKONwIgdiFhONyx2WjZLvZs5CrT4StqjqNdsiTMBvyW', 'Carlos Supervisor', 'supervisor@empresa.com', 'supervisor'),
('empleado1', '$2b$10$8K1p/a0dclxKONwIgdiFhONyx2WjZLvZs5CrT4StqjqNdsiTMBvyW', 'María Empleada', 'empleado1@empresa.com', 'empleado'),
('empleado2', '$2b$10$8K1p/a0dclxKONwIgdiFhONyx2WjZLvZs5CrT4StqjqNdsiTMBvyW', 'Juan Empleado', 'empleado2@empresa.com', 'empleado');

-- Insertar partes de ejemplo
INSERT INTO partes (codigo, nombre, categoria, marca, modelo_compatible, precio, stock, stock_minimo, ubicacion, proveedor, descripcion, usuario_creacion) VALUES
-- Partes eléctricas
('ELE001', 'Batería 12V 60Ah', 'electrica', 'Bosch', 'Universal', 250000, 15, 5, 'Estante A1', 'Distribuidora Eléctrica', 'Batería de arranque para vehículos', 1),
('ELE002', 'Alternador 90A', 'electrica', 'Valeo', 'Chevrolet Aveo', 180000, 8, 3, 'Estante A2', 'Repuestos GM', 'Alternador remanufacturado', 1),
('ELE003', 'Motor de Arranque', 'electrica', 'Denso', 'Toyota Corolla', 320000, 5, 2, 'Estante A3', 'Toyota Repuestos', 'Motor de arranque original', 1),
('ELE004', 'Bujías NGK', 'electrica', 'NGK', 'Universal', 25000, 50, 20, 'Estante A4', 'NGK Colombia', 'Set de 4 bujías', 1),

-- Partes de motor
('MOT001', 'Filtro de Aceite', 'motor', 'Mann', 'Universal', 35000, 30, 10, 'Estante B1', 'Filtros Mann', 'Filtro de aceite estándar', 1),
('MOT002', 'Correa de Distribución', 'motor', 'Gates', 'Renault Logan', 85000, 12, 4, 'Estante B2', 'Gates Colombia', 'Kit completo de distribución', 1),
('MOT003', 'Bomba de Agua', 'motor', 'Graf', 'Volkswagen Gol', 120000, 6, 2, 'Estante B3', 'Graf Repuestos', 'Bomba de agua con empaque', 1),
('MOT004', 'Termostato', 'motor', 'Wahler', 'Chevrolet Spark', 45000, 20, 8, 'Estante B4', 'Wahler Parts', 'Termostato 82°C', 1),

-- Partes de frenos
('FRE001', 'Pastillas Delanteras', 'frenos', 'Brembo', 'Honda Civic', 95000, 25, 8, 'Estante C1', 'Brembo Colombia', 'Pastillas cerámicas', 1),
('FRE002', 'Discos de Freno', 'frenos', 'ATE', 'Mazda 3', 180000, 10, 4, 'Estante C2', 'ATE Frenos', 'Par de discos ventilados', 1),
('FRE003', 'Cilindro Maestro', 'frenos', 'LUK', 'Nissan Sentra', 150000, 8, 3, 'Estante C3', 'LUK Repuestos', 'Cilindro con depósito', 1),
('FRE004', 'Líquido de Frenos DOT4', 'frenos', 'Castrol', 'Universal', 18000, 40, 15, 'Estante C4', 'Castrol Colombia', 'Botella 500ml', 1),

-- Partes de suspensión
('SUS001', 'Amortiguador Delantero', 'suspension', 'Monroe', 'Hyundai Accent', 220000, 12, 4, 'Estante D1', 'Monroe Suspensión', 'Amortiguador a gas', 1),
('SUS002', 'Resorte Helicoidal', 'suspension', 'Eibach', 'Kia Rio', 85000, 16, 6, 'Estante D2', 'Eibach Springs', 'Resorte progresivo', 1),
('SUS003', 'Rótula Superior', 'suspension', 'Moog', 'Ford Fiesta', 65000, 20, 8, 'Estante D3', 'Moog Chassis', 'Rótula con grasa', 1),
('SUS004', 'Barra Estabilizadora', 'suspension', 'TRW', 'Peugeot 206', 120000, 8, 3, 'Estante D4', 'TRW Automotive', 'Barra con bujes', 1),

-- Partes de transmisión
('TRA001', 'Embrague Completo', 'transmision', 'Sachs', 'Volkswagen Polo', 380000, 5, 2, 'Estante E1', 'Sachs Clutch', 'Kit completo 3 piezas', 1),
('TRA002', 'Aceite de Transmisión', 'transmision', 'Mobil', 'Universal', 45000, 25, 10, 'Estante E2', 'Mobil Lubricantes', 'ATF Dexron III', 1),
('TRA003', 'Junta Homocinética', 'transmision', 'GKN', 'Chevrolet Aveo', 180000, 10, 4, 'Estante E3', 'GKN Driveline', 'Junta lado rueda', 1),
('TRA004', 'Filtro Transmisión', 'transmision', 'Wix', 'Toyota Yaris', 55000, 15, 6, 'Estante E4', 'Wix Filters', 'Filtro automática', 1);
