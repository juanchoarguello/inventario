import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sistema de Inventario Empresarial",
  description: "Plataforma integral de gestión desarrollada con tecnología de vanguardia",
  keywords: ["inventario", "gestión", "autopartes", "sistema", "empresarial"],
  authors: [{ name: "Juan Sebastian Arguello Lozano" }],
  creator: "Juan Sebastian Arguello Lozano",
  publisher: "Juan Sebastian Arguello Lozano",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    title: "Sistema de Inventario Empresarial",
    description: "Plataforma integral de gestión desarrollada con tecnología de vanguardia",
    siteName: "Sistema de Inventario",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Inventario Empresarial",
    description: "Plataforma integral de gestión desarrollada con tecnología de vanguardia",
  },
}

// Configuración de viewport separada para Next.js 15
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
