"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Site } from "@/types/site"
import SiteTable from "./site-table"
import SiteFilters from "./site-filters"
import ImportCSV from "./import-csv"
import AddSiteButton from "./add-site-button"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV } from "@/lib/csv-utils"
import { useToast } from "@/hooks/use-toast"

export default function SiteManagement() {
  const [sites, setSites] = useState<Site[]>([])
  const [filteredSites, setFilteredSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchSites()
  }, [])

  useEffect(() => {
    filterSites()
  }, [sites, searchTerm, statusFilter])

  const fetchSites = async () => {
    setLoading(true)
    try {
      const sitesCollection = collection(db, "sites")
      const sitesQuery = query(sitesCollection, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(sitesQuery)

      const sitesList: Site[] = []
      querySnapshot.forEach((doc) => {
        sitesList.push({ id: doc.id, ...doc.data() } as Site)
      })

      setSites(sitesList)
    } catch (error) {
      console.error("Erro ao buscar sites:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar sites. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSites = () => {
    let filtered = [...sites]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((site) => site.siteUrl.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((site) => site.status === statusFilter)
    }

    setFilteredSites(filtered)
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredSites, "licencas-sites")
      toast({
        title: "Sucesso",
        description: "Sites exportados com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar sites",
        variant: "destructive",
      })
    }
  }

  const handleImportSuccess = () => {
    fetchSites()
    toast({
      title: "Sucesso",
      description: "Sites importados com sucesso",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SiteFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <div className="flex gap-2">
          <ImportCSV onImportSuccess={handleImportSuccess} />
          <AddSiteButton onSiteAdded={fetchSites} />
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <SiteTable sites={filteredSites} loading={loading} onSiteUpdated={fetchSites} onSiteDeleted={fetchSites} />
    </div>
  )
}
