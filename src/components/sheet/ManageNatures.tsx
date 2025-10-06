"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useNatures } from "@/hooks/use-natures";
import { CREATE_NATURE_FORM_SCHEMA } from "@/lib/definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { createNature, deleteNature } from "@/actions/natures";
import { toast } from "sonner";

export default function ManageNaturesSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: natures, isLoading, mutate } = useNatures();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof CREATE_NATURE_FORM_SCHEMA>>({
    resolver: zodResolver(CREATE_NATURE_FORM_SCHEMA),
    defaultValues: { label: "" },
  });

  const onSubmit = async (data: z.infer<typeof CREATE_NATURE_FORM_SCHEMA>) => {
    const res = await createNature(data);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Nature créée");
      form.reset({ label: "" });
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    setSubmittingId(id);
    const res = await deleteNature(id);
    if ("error" in res) toast.error(res.error);
    else {
      toast.success("Nature supprimée");
      mutate();
    }
    setSubmittingId(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Gérer les natures d&apos;événement</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-6">
          <form
            className="flex items-center gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Input
              placeholder="Libellé de la nature"
              aria-invalid={!!form.formState.errors.label}
              {...form.register("label")}
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

          <div className="space-y-2">
            {isLoading && <div>Chargement…</div>}
            {natures?.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Aucune nature.
              </div>
            )}
            {natures?.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span>{n.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDelete(n.id)}
                  disabled={submittingId === n.id}
                >
                  {submittingId === n.id ? "…" : "Supprimer"}
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
