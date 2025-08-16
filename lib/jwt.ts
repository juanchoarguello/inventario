import jwt from "jsonwebtoken"
import type { AuthUser } from "@/lib/types"

export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || "fallback-secret-key"
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

  static sign(payload: AuthUser): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
    })
  }

  static verify(token: string): AuthUser | null {
    try {
      return jwt.verify(token, this.SECRET) as AuthUser
    } catch (error) {
      return null
    }
  }

  static decode(token: string): any {
    try {
      return jwt.decode(token)
    } catch (error) {
      return null
    }
  }
}
