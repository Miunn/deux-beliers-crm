"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useLabels } from "@/hooks/use-labels";
import { updateContactLabels } from "@/actions/contacts";
import { toast } from "sonner";
import { Contact, Label } from "../../../generated/prisma";
import { useSWRConfig } from "swr";

export default function ContactLabelsDialog({
  contact,
  open,
  onOpenChange,
  children,
}: {
  contact: Contact & { labels: Label[] };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const { mutate: globalMutate } = useSWRConfig();
  const [isOpen, setIsOpen] = useState(open ?? false);
  const internalOpen = open ?? isOpen;
  const internalOnOpenChange = onOpenChange ?? setIsOpen;
  const { data: allLabels, isLoading } = useLabels();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(contact.labels.map((l) => l.id))
  );
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSave = async () => {
    const res = await updateContactLabels(contact.id, Array.from(selected));
    if ("error" in res) toast.error(res.error);
    else {
      toast.success("Libellés mis à jour");
      globalMutate("/api/contacts");
      internalOnOpenChange(false);
    }
  };

  return (
    <Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="flex flex-col gap-0 p-0 min-w-[40%] sm:max-h-[min(640px,80vh)] sm:max-w-md [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Libellés du contact
          </DialogTitle>
          <div className="overflow-y-auto">
            <div className="p-6 space-y-3">
              {isLoading && <div className="text-sm">Chargement…</div>}
              <div className="grid grid-cols-1 gap-2">
                {allLabels?.map((l) => (
                  <label
                    key={l.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={selected.has(l.id)}
                      onChange={() => toggle(l.id)}
                    />
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      style={{ background: l.color, color: "#fff" }}
                    >
                      {l.label}
                    </span>
                  </label>
                ))}
                {allLabels && allLabels.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Aucun libellé.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
