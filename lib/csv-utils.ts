import Papa from "papaparse"
import { calculateExpirationDate } from "./date-utils"

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export const validateCSVData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Verificar se os dados estão vazios
  if (!data || data.length === 0) {
    errors.push("Arquivo CSV está vazio")
    return { valid: false, errors }
  }

  // Campos obrigatórios
  const requiredFields = ["siteUrl", "status", "purchaseDate", "orderCode", "activationDate"]

  // Verificar se todos os campos obrigatórios estão presentes no cabeçalho
  const firstRow = data[0]
  const missingFields = requiredFields.filter((field) => !Object.keys(firstRow).includes(field))

  if (missingFields.length > 0) {
    errors.push(`Colunas obrigatórias ausentes: ${missingFields.join(", ")}`)
    return { valid: false, errors }
  }

  // Validar cada linha
  data.forEach((row, index) => {
    // Verificar campos obrigatórios
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Linha ${index + 1}: Valor ausente para ${field}`)
      }
    })

    // Validar URL
    if (row.siteUrl && !isValidUrl(row.siteUrl)) {
      errors.push(`Linha ${index + 1}: Formato de URL inválido para ${row.siteUrl}`)
    }

    // Validar status
    if (row.status && !["ativo", "inativo", "vencido"].includes(row.status)) {
      errors.push(
        `Linha ${index + 1}: Valor de status inválido (${row.status}). Deve ser 'ativo', 'inativo' ou 'vencido'`,
      )
    }

    // Validar datas
    if (row.purchaseDate && !isValidDate(row.purchaseDate)) {
      errors.push(`Linha ${index + 1}: Formato de data de compra inválido (${row.purchaseDate})`)
    }

    if (row.activationDate && !isValidDate(row.activationDate)) {
      errors.push(`Linha ${index + 1}: Formato de data de ativação inválido (${row.activationDate})`)
    }

    if (row.migrationDate && row.migrationDate.trim() !== "" && !isValidDate(row.migrationDate)) {
      errors.push(`Linha ${index + 1}: Formato de data de migração inválido (${row.migrationDate})`)
    }
  })

  // Processar dados se válidos
  if (errors.length === 0) {
    // Adicionar campos calculados e normalizar dados
    data.forEach((row) => {
      // Calcular data de vencimento
      if (row.activationDate) {
        row.expirationDate = calculateExpirationDate(row.activationDate)
      }

      // Converter renovado para booleano
      if (row.renewed !== undefined) {
        row.renewed = row.renewed === "true" || row.renewed === true || row.renewed === "yes" || row.renewed === "sim"
      } else {
        row.renewed = false
      }

      // Garantir que migrationDate seja null se vazio
      if (!row.migrationDate || row.migrationDate.trim() === "") {
        row.migrationDate = null
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

export const exportToCSV = (data: any[], filename: string) => {
  // Preparar dados para exportação
  const exportData = data.map((site) => ({
    siteUrl: site.siteUrl,
    status: site.status,
    purchaseDate: site.purchaseDate,
    orderCode: site.orderCode,
    activationDate: site.activationDate,
    expirationDate: site.expirationDate,
    migrationDate: site.migrationDate || "",
    renewed: site.renewed ? "true" : "false",
  }))

  // Gerar CSV
  const csv = Papa.unparse(exportData)

  // Criar link de download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Funções auxiliares
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}
