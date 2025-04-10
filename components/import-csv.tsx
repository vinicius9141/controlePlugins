"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, FileText, Check, X } from "lucide-react"
import { parseCSV, validateCSVData } from "@/lib/csv-utils"
import { batchAddSites } from "@/lib/site-service"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ImportCSVProps {
  onImportSuccess: () => void
}

export default function ImportCSV({ onImportSuccess }: ImportCSVProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setErrors([])
    } else {
      setFile(null)
      setErrors(["Por favor, selecione um arquivo CSV válido"])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
      setErrors([])
    } else {
      setFile(null)
      setErrors(["Por favor, selecione um arquivo CSV válido"])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setFile(null)
    setErrors([])
    setProgress(0)
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setProgress(10)

    try {
      // Parse CSV
      const parsedData = await parseCSV(file)
      setProgress(30)

      // Validate data
      const { valid, errors: validationErrors } = validateCSVData(parsedData)
      setProgress(50)

      if (!valid) {
        setErrors(validationErrors)
        setIsUploading(false)
        setProgress(0)
        return
      }

      // Import data
      await batchAddSites(parsedData, (p) => {
        setProgress(50 + Math.floor(p * 50))
      })

      setProgress(100)
      toast({
        title: "Sucesso",
        description: `Importados ${parsedData.length} sites com sucesso`,
      })

      // Close dialog and reset
      setTimeout(() => {
        setOpen(false)
        resetFileInput()
        onImportSuccess()
      }, 1000)
    } catch (error) {
      console.error("Erro ao importar CSV:", error)
      setErrors(["Falha ao processar arquivo CSV. Por favor, verifique o formato e tente novamente."])
      setProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!isUploading) {
            setOpen(value)
            if (!value) resetFileInput()
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Importar Sites de CSV</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV com dados dos sites. O arquivo deve incluir as seguintes colunas: siteUrl,
              status, purchaseDate, orderCode, activationDate.
            </DialogDescription>
          </DialogHeader>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              file ? "border-green-500 bg-green-50" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-green-500" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                <Button variant="outline" size="sm" onClick={resetFileInput} className="mt-2">
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Arraste e solte seu arquivo CSV aqui</p>
                <p className="text-sm text-muted-foreground">ou clique para navegar</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || isUploading} className="flex items-center gap-2">
              {isUploading ? (
                <>Importando...</>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
