-- Crear base de datos y tablas para el sistema de inventario de partes automotrices

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'supervisor', 'empleado')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de partes
CREATE TABLE IF NOT EXISTS partes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('electrica', 'motor', 'frenos', 'suspension', 'transmision')),
    marca VARCHAR(50) NOT NULL,
    modelo_compatible VARCHAR(100),
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    ubicacion VARCHAR(100),
    proveedor VARCHAR(100),
    descripcion TEXT,
    usuario_creacion INTEGER REFERENCES usuarios(id),
    usuario_actualizacion INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de historial de acciones
CREATE TABLE IF NOT EXISTS historial_acciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
    tabla VARCHAR(50) NOT NULL,
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_partes_codigo ON partes(codigo);
CREATE INDEX IF NOT EXISTS idx_partes_categoria ON partes(categoria);
CREATE INDEX IF NOT EXISTS idx_partes_stock ON partes(stock);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_acciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_acciones(fecha_accion);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_fecha_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_partes_fecha_actualizacion
    BEFORE UPDATE ON partes
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();
