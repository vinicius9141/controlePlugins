export interface Site {
  id: string
  siteUrl: string
  status: string
  purchaseDate: string
  orderCode: string
  activationDate: string
  expirationDate: string
  migrationDate?: string | null
  renewed: boolean
  createdAt: any
  updatedAt: any
}
