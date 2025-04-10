import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Site } from "@/types/site"
import SiteForm from "./site-form"

interface EditSiteDialogProps {
  site: Site
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export default function EditSiteDialog({ site, open, onOpenChange, onSaved }: EditSiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Site</DialogTitle>
        </DialogHeader>
        <SiteForm site={site} onSubmitSuccess={onSaved} />
      </DialogContent>
    </Dialog>
  )
}
