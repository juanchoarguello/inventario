-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  ultimo_acceso TIMESTAMP
);

-- Crear tabla de partes
CREATE TABLE IF NOT EXISTS partes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  marca VARCHAR(100),
  modelo_compatible VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL,
  proveedor VARCHAR(100),
  ubicacion VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  usuario_creacion INTEGER REFERENCES usuarios(id),
  usuario_actualizacion INTEGER REFERENCES usuarios(id)
);

-- Crear tabla de historial de acciones
CREATE TABLE IF NOT EXISTS historial_acciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(50),
  registro_id VARCHAR(50),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  direccion_ip VARCHAR(45),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_partes_categoria ON partes(categoria);
CREATE INDEX IF NOT EXISTS idx_partes_codigo ON partes(codigo);
CREATE INDEX IF NOT EXISTS idx_partes_stock ON partes(stock);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_acciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_acciones(fecha);
