"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Site } from "@/types/site"
import { addSite, updateSite } from "@/lib/site-service"
import { calculateExpirationDate } from "@/lib/date-utils"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  siteUrl: z.string().url("Por favor, insira uma URL válida"),
  status: z.enum(["ativo", "inativo", "vencido"]),
  purchaseDate: z.string().min(1, "Data de compra é obrigatória"),
  orderCode: z.string().min(1, "Código do pedido é obrigatório"),
  activationDate: z.string().min(1, "Data de ativação é obrigatória"),
  migrationDate: z.string().optional(),
  renewed: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface SiteFormProps {
  site?: Site
  onSubmitSuccess: () => void
}

export default function SiteForm({ site, onSubmitSuccess }: SiteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: site
      ? {
          siteUrl: site.siteUrl,
          status: site.status as "ativo" | "inativo" | "vencido",
          purchaseDate: site.purchaseDate,
          orderCode: site.orderCode,
          activationDate: site.activationDate,
          migrationDate: site.migrationDate || "",
          renewed: site.renewed,
        }
      : {
          siteUrl: "",
          status: "ativo",
          purchaseDate: new Date().toISOString().split("T")[0],
          orderCode: "",
          activationDate: new Date().toISOString().split("T")[0],
          migrationDate: "",
          renewed: false,
        },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const expirationDate = calculateExpirationDate(values.activationDate)

      const siteData = {
        ...values,
        expirationDate,
        migrationDate: values.migrationDate || null,
      }

      if (site) {
        await updateSite(site.id, siteData)
        toast({
          title: "Sucesso",
          description: "Site atualizado com sucesso",
        })
      } else {
        await addSite(siteData)
        toast({
          title: "Sucesso",
          description: "Site adicionado com sucesso",
        })
      }

      onSubmitSuccess()
    } catch (error) {
      console.error("Erro ao salvar site:", error)
      toast({
        title: "Erro",
        description: site ? "Falha ao atualizar site" : "Falha ao adicionar site",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="siteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Site</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Pedido</FormLabel>
                <FormControl>
                  <Input placeholder="Código do pedido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Compra</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Ativação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="migrationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Migração (Opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renewed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Renovado</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {site ? "Atualizando..." : "Adicionando..."}
              </>
            ) : site ? (
              "Atualizar Site"
            ) : (
              "Adicionar Site"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
