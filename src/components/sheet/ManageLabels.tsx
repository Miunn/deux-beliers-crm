"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useLabels } from "@/hooks/use-labels";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CREATE_LABEL_FORM_SCHEMA } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { createLabel, deleteLabel } from "@/actions/labels";
import { toast } from "sonner";

export default function ManageLabelsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: labels, isLoading, mutate } = useLabels();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof CREATE_LABEL_FORM_SCHEMA>>({
    resolver: zodResolver(CREATE_LABEL_FORM_SCHEMA),
    defaultValues: { label: "", color: "#4f46e5" },
  });

  const onSubmit = (data: z.infer<typeof CREATE_LABEL_FORM_SCHEMA>) => {
    createLabel(data).then((res) => {
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Libellé créé");
        form.reset({ label: "", color: form.getValues("color") || "#4f46e5" });
        mutate();
      }
    });
  };

  const handleDelete = async (id: string) => {
    setSubmittingId(id);
    const res = await deleteLabel(id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Libellé supprimé");
      mutate();
    }
    setSubmittingId(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Gérer les libellés</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          <form
            className="flex items-center gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Input
              placeholder="Nom du libellé"
              aria-invalid={!!form.formState.errors.label}
              {...form.register("label")}
            />
            <input
              type="color"
              aria-label="Couleur"
              className="h-9 w-12 rounded-md border"
              {...form.register("color")}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Ajout..." : "Ajouter"}
            </Button>
          </form>
          {form.formState.errors.label && (
            <p className="text-sm text-red-600">
              {form.formState.errors.label.message}
            </p>
          )}
          {form.formState.errors.color && (
            <p className="text-sm text-red-600">
              {form.formState.errors.color.message}
            </p>
          )}

          <div className="space-y-2">
            {isLoading && <div>Chargement…</div>}
            {labels?.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Aucun libellé.
              </div>
            )}
            {labels?.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block size-4 rounded"
                    style={{ background: l.color }}
                  />
                  <span>{l.label}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDelete(l.id)}
                  disabled={submittingId === l.id}
                >
                  {submittingId === l.id ? "…" : "Supprimer"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
