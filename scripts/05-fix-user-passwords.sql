-- Script para arreglar las contraseñas de usuarios
-- Este script actualiza todos los usuarios con un hash correcto para "admin123"

-- Primero, vamos a limpiar y recrear los usuarios con el hash correcto
-- El hash correcto para "admin123" se generará en el script JS

-- Limpiar sesiones activas para forzar nuevo login
UPDATE sesiones SET activa = false WHERE activa = true;

-- Nota: El hash se actualizará mediante el script JavaScript
-- porque necesitamos generar un hash válido usando bcrypt

-- Verificar usuarios existentes
SELECT 
    id, 
    username, 
    email, 
    nombre_completo, 
    rol, 
    activo,
    SUBSTRING(password_hash, 1, 30) || '...' as hash_preview
FROM usuarios 
ORDER BY id;
