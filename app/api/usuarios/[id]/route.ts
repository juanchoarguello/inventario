import { type NextRequest, NextResponse } from "next/server"
import { UsuariosRepository } from "@/lib/usuarios"
import { HistorialRepository } from "@/lib/historial"
import { PasswordService } from "@/lib/password"
import { withAdminAuth } from "@/lib/auth"
import { extractRequestInfo } from "@/lib/request"
import type { CreateUserData } from "@/lib/types"

export const PUT = withAdminAuth(async (request: NextRequest, user, context) => {
  try {
    const params = context?.params ? await context.params : {}
    const id = Number.parseInt(params.id as string)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    // Obtener datos anteriores para el historial
    const usuarioAnterior = await UsuariosRepository.findById(id)
    if (!usuarioAnterior) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userData: Partial<CreateUserData> = await request.json()

    // Si se proporciona contraseña, validarla y hashearla
    if (userData.password) {
      const passwordValidation = PasswordService.validate(userData.password)
      if (!passwordValidation.isValid) {
        return NextResponse.json({ error: passwordValidation.errors.join(", ") }, { status: 400 })
      }
      userData.password = await PasswordService.hash(userData.password)
    }

    const usuarioActualizado = await UsuariosRepository.update(id, userData)

    if (!usuarioActualizado) {
      return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
    }

    // Registrar en historial (sin contraseñas)
    const { ip, userAgent } = extractRequestInfo(request)
    const usuarioAnteriorSinPassword = { ...usuarioAnterior }
    const usuarioActualizadoSinPassword = { ...usuarioActualizado }
    delete usuarioAnteriorSinPassword.password
    delete usuarioActualizadoSinPassword.password

    await HistorialRepository.registrarAccion(
      user.id,
      "ACTUALIZAR_USUARIO",
      "usuarios",
      id.toString(),
      usuarioAnteriorSinPassword,
      usuarioActualizadoSinPassword,
      ip,
      userAgent,
    )

    return NextResponse.json(usuarioActualizado)
  } catch (error) {
    console.error("Error updating usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const DELETE = withAdminAuth(async (request: NextRequest, user, context) => {
  try {
    const params = context?.params ? await context.params : {}
    const id = Number.parseInt(params.id as string)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    // No permitir que el admin se elimine a sí mismo
    if (id === user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propio usuario" }, { status: 400 })
    }

    // Obtener datos antes de eliminar para el historial
    const usuarioAEliminar = await UsuariosRepository.findById(id)
    if (!usuarioAEliminar) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const deleted = await UsuariosRepository.delete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
    }

    // Registrar en historial (sin contraseña)
    const { ip, userAgent } = extractRequestInfo(request)
    const usuarioParaHistorial = { ...usuarioAEliminar }
    delete usuarioParaHistorial.password

    await HistorialRepository.registrarAccion(
      user.id,
      "ELIMINAR_USUARIO",
      "usuarios",
      id.toString(),
      usuarioParaHistorial,
      null,
      ip,
      userAgent,
    )

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
