import { format, addYears, isBefore, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    return format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dateString
  }
}

export const calculateExpirationDate = (activationDate: string): string => {
  try {
    const date = new Date(activationDate)
    const expirationDate = addYears(date, 1)
    return expirationDate.toISOString().split("T")[0]
  } catch (error) {
    console.error("Erro ao calcular data de vencimento:", error)
    return ""
  }
}

export const isExpiringSoon = (expirationDate: string): boolean => {
  try {
    const expDate = new Date(expirationDate)
    const today = new Date()

    // Verificar se a data de vencimento está no futuro
    if (isBefore(today, expDate)) {
      // Verificar se está dentro de 10 dias
      const daysUntilExpiration = differenceInDays(expDate, today)
      return daysUntilExpiration <= 10
    }

    return false
  } catch (error) {
    console.error("Erro ao verificar se está expirando em breve:", error)
    return false
  }
}

export const isExpired = (expirationDate: string): boolean => {
  try {
    const expDate = new Date(expirationDate)
    const today = new Date()

    return isBefore(expDate, today)
  } catch (error) {
    console.error("Erro ao verificar se expirou:", error)
    return false
  }
}
