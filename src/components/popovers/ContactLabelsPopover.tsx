"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useLabels } from "@/hooks/use-labels";
import { Contact, Label } from "../../../generated/prisma";
import { updateContactLabels } from "@/actions/contacts";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function ContactLabelsPopover({
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
  const { data: allLabels, isLoading } = useLabels();
  const { mutate } = useSWRConfig();
  const [internalOpen, setInternalOpen] = useState(open ?? false);
  const handleOpenChange = onOpenChange ?? setInternalOpen;
  const [selected, setSelected] = useState<Set<string>>(
    new Set(contact.labels.map((l) => l.id))
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const toggle = async (labelId: string) => {
    const next = new Set(selected);
    if (next.has(labelId)) next.delete(labelId);
    else next.add(labelId);

    // optimistic update
    setSelected(new Set(next));
    setSavingId(labelId);
    const res = await updateContactLabels(contact.id, Array.from(next));
    setSavingId(null);
    if ("error" in res) {
      // revert on error
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      setSelected(new Set(next));
      toast.error(res.error);
    } else {
      mutate("/api/contacts");
    }
  };

  return (
    <Popover open={internalOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-2 text-sm font-medium border-b">Libellés</div>
        <div className="max-h-64 overflow-auto">
          {isLoading && (
            <div className="p-3 text-sm text-muted-foreground">Chargement…</div>
          )}
          {allLabels && allLabels.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              Aucun libellé.
            </div>
          )}
          <ul className="py-1">
            {allLabels?.map((l) => {
              const active = selected.has(l.id);
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent ${
                      savingId === l.id ? "opacity-70" : ""
                    }`}
                    onClick={() => toggle(l.id)}
                    disabled={!!savingId}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-3 rounded"
                        style={{ background: l.color }}
                      />
                      <span>{l.label}</span>
                    </span>
                    {active ? <Check className="w-4 h-4" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
