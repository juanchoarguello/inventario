"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HelpCircle, PlayCircle, BookOpen, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HelpButtonProps {
  section: string
  title: string
  content: string[]
  videoUrl?: string
  videoTimestamp?: number
}

export function HelpButton({ section, title, content, videoUrl, videoTimestamp }: HelpButtonProps) {
  const [open, setOpen] = useState(false)

  const handleVideoClick = () => {
    if (videoUrl) {
      const url = videoTimestamp 
        ? `${videoUrl}?t=${videoTimestamp}`
        : videoUrl
      window.open(url, '_blank')
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-6 w-6 p-0 rounded-full hover:bg-blue-100"
        title={`Ayuda: ${title}`}
      >
        <HelpCircle className="h-4 w-4 text-blue-600" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <DialogTitle>{title}</DialogTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Sección: {section}
              </Badge>
            </div>
            <DialogDescription>
              Guía paso a paso para esta funcionalidad
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {content.map((paragraph, index) => (
              <div key={index} className="space-y-2">
                {paragraph.includes('•') ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {paragraph.split('•').filter(Boolean).map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : paragraph.startsWith('⚠️') || paragraph.startsWith('🟠') ? (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                    <p className="text-sm text-orange-800">{paragraph}</p>
                  </div>
                ) : paragraph.startsWith('✅') || paragraph.startsWith('🟢') ? (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                    <p className="text-sm text-green-800">{paragraph}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{paragraph}</p>
                )}
              </div>
            ))}

            {videoUrl && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    Video Tutorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3">
                    Mira el video completo de esta sección para una explicación detallada.
                  </p>
                  <Button 
                    onClick={handleVideoClick}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Ver Video Tutorial
                    {videoTimestamp && (
                      <span className="ml-2 text-xs opacity-75">
                        ({Math.floor(videoTimestamp / 60)}:{String(videoTimestamp % 60).padStart(2, '0')})
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para video tutorial completo
interface VideoTutorialButtonProps {
  videoUrl: string
  title?: string
}

export function VideoTutorialButton({ videoUrl, title = "Tutorial Completo" }: VideoTutorialButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <PlayCircle className="mr-2 h-4 w-4" />
        {title}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              Video Tutorial Completo
            </DialogTitle>
            <DialogDescription>
              Guía completa del sistema de facturación
            </DialogDescription>
          </DialogHeader>

          <div className="aspect-video w-full">
            {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
              <iframe
                className="w-full h-full rounded-lg"
                src={videoUrl.replace('watch?v=', 'embed/')}
                title="Tutorial de Facturación"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full rounded-lg"
                controls
                src={videoUrl}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              ¿Tienes dudas? Usa los botones de ayuda (?) en cada sección
            </p>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Tooltip de ayuda rápida
interface QuickHelpProps {
  text: string
}

export function QuickHelp({ text }: QuickHelpProps) {
  return (
    <div className="inline-flex items-center">
      <div className="group relative">
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
    </div>
  )
}