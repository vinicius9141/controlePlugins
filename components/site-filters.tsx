"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface SiteFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

export default function SiteFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: SiteFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar sites..."
          className="w-full sm:w-[250px] pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
