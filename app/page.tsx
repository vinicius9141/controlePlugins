import { Suspense } from "react"
import SiteManagement from "@/components/site-management"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciador de Licenças de Sites</h1>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SiteManagement />
      </Suspense>
    </main>
  )
}
