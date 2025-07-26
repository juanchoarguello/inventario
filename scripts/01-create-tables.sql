-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado' CHECK (rol IN ('admin', 'supervisor', 'empleado')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Crear tabla de partes
CREATE TABLE IF NOT EXISTS partes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('electrica', 'motor', 'transmision', 'frenos', 'suspension')),
    marca VARCHAR(100) NOT NULL,
    modelo_compatible TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    ubicacion VARCHAR(50),
    proveedor VARCHAR(100),
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion INTEGER REFERENCES usuarios(id),
    usuario_actualizacion INTEGER REFERENCES usuarios(id)
);

-- Crear tabla de historial de acciones
CREATE TABLE IF NOT EXISTS historial_acciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_partes_categoria ON partes(categoria);
CREATE INDEX IF NOT EXISTS idx_partes_codigo ON partes(codigo);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_acciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_acciones(fecha_accion);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
