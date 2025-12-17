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
import { createNature, deleteNature, updateNature } from "@/actions/natures";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Loader2,
  EllipsisVertical,
  Pencil,
  Trash,
  Save,
  X,
} from "lucide-react";

export default function ManageNaturesSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: natures, isLoading, mutate } = useNatures();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>("");
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

  const startEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditLabel(label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSubmittingId(editingId);
    const validated = CREATE_NATURE_FORM_SCHEMA.safeParse({
      label: editLabel,
    });
    if (!validated.success) {
      toast.error(validated.error.message);
      setSubmittingId(null);
      return;
    }
    const res = await updateNature(editingId, validated.data);
    if ("error" in res) toast.error(res.error);
    else {
      toast.success("Nature mise à jour");
      await mutate();
      cancelEdit();
    }
    setSubmittingId(null);
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
                {editingId === n.id ? (
                  <div className="flex items-center gap-3 w-full">
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1"
                      aria-label="Nom du libellé"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={saveEdit}
                      disabled={submittingId === n.id}
                    >
                      {submittingId === n.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEdit}
                      size="icon"
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{n.label}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={submittingId === n.id}
                        >
                          {submittingId === n.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <EllipsisVertical />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => startEdit(n.id, n.label)}
                        >
                          <Pencil />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(n.id)}
                        >
                          <Trash />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                  // <Button
                  //   type="button"
                  //   variant="ghost"
                  //   onClick={() => handleDelete(n.id)}
                  //   disabled={submittingId === n.id}
                  // >
                  //   {submittingId === n.id ? "…" : "Supprimer"}
                  // </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
