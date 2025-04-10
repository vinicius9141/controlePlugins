"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import SiteForm from "./site-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AddSiteButtonProps {
  onSiteAdded: () => void
}

export default function AddSiteButton({ onSiteAdded }: AddSiteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Adicionar Site
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Site</DialogTitle>
          </DialogHeader>
          <SiteForm
            onSubmitSuccess={() => {
              setOpen(false)
              onSiteAdded()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
