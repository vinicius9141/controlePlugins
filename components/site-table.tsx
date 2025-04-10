"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Site } from "@/types/site"
import { formatDate, isExpiringSoon, isExpired } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EditSiteDialog from "./edit-site-dialog"
import { deleteSite } from "@/lib/site-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SiteTableProps {
  sites: Site[]
  loading: boolean
  onSiteUpdated: () => void
  onSiteDeleted: () => void
}

export default function SiteTable({ sites, loading, onSiteUpdated, onSiteDeleted }: SiteTableProps) {
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [deletingSite, setDeletingSite] = useState<Site | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deletingSite) return

    setIsDeleting(true)
    try {
      await deleteSite(deletingSite.id)
      toast({
        title: "Sucesso",
        description: "Site excluído com sucesso",
      })
      onSiteDeleted()
    } catch (error) {
      console.error("Erro ao excluir site:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir site",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingSite(null)
    }
  }

  const getStatusBadge = (site: Site) => {
    switch (site.status) {
      case "ativo":
        return isExpiringSoon(site.expirationDate) ? (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expirando em Breve
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Ativo
          </Badge>
        )
      case "inativo":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Inativo
          </Badge>
        )
      case "vencido":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Vencido
          </Badge>
        )
      default:
        return <Badge>{site.status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL do Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Compra</TableHead>
              <TableHead>Código do Pedido</TableHead>
              <TableHead>Data de Ativação</TableHead>
              <TableHead>Data de Vencimento</TableHead>
              <TableHead>Data de Migração</TableHead>
              <TableHead>Renovado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum site encontrado
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow
                  key={site.id}
                  className={
                    isExpired(site.expirationDate) && site.status === "ativo"
                      ? "bg-red-50"
                      : isExpiringSoon(site.expirationDate) && site.status === "ativo"
                        ? "bg-amber-50"
                        : ""
                  }
                >
                  <TableCell className="font-medium">{site.siteUrl}</TableCell>
                  <TableCell>{getStatusBadge(site)}</TableCell>
                  <TableCell>{formatDate(site.purchaseDate)}</TableCell>
                  <TableCell>{site.orderCode}</TableCell>
                  <TableCell>{formatDate(site.activationDate)}</TableCell>
                  <TableCell>{formatDate(site.expirationDate)}</TableCell>
                  <TableCell>{site.migrationDate ? formatDate(site.migrationDate) : "-"}</TableCell>
                  <TableCell>
                    {site.renewed ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingSite(site)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingSite(site)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingSite && (
        <EditSiteDialog
          site={editingSite}
          open={!!editingSite}
          onOpenChange={(open) => !open && setEditingSite(null)}
          onSaved={() => {
            setEditingSite(null)
            onSiteUpdated()
          }}
        />
      )}

      <AlertDialog open={!!deletingSite} onOpenChange={(open) => !open && setDeletingSite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente o site {deletingSite?.siteUrl}. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
