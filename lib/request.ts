import type { NextRequest } from "next/server"

/**
 * Extrae información del request para el historial
 */
export function extractRequestInfo(request: NextRequest) {
  // Obtener IP del cliente
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || request.ip || "unknown"

  // Obtener User Agent
  const userAgent = request.headers.get("user-agent") || "unknown"

  return {
    ip: ip.trim(),
    userAgent: userAgent.substring(0, 500), // Limitar longitud
  }
}
