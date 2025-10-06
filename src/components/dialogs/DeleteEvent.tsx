"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { deleteEvent } from "@/actions/events";
import { toast } from "sonner";
import { Event, Nature } from "../../../generated/prisma";

export default function DeleteEvent({
  event,
  open,
  onOpenChange,
  children,
  onDeleted,
}: {
  event: Event & { nature: Nature | null };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  onDeleted?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const internalOpen = open ?? isOpen;
  const internalOnOpenChange = onOpenChange ?? setIsOpen;

  const handleDelete = async () => {
    const res = await deleteEvent(event.id);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success("Événement supprimé");
      internalOnOpenChange(false);
      onDeleted?.();
    }
  };

  return (
    <Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;événement</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet événement ?
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Date: </span>
            {new Date(event.date).toLocaleString()}
          </div>
          {/* nature is now a relation; when loaded with include it will have label */}
          {event.nature?.label && (
            <div>
              <span className="font-medium">Nature: </span>
              {event.nature.label}
            </div>
          )}
          {event.attendus && (
            <div>
              <span className="font-medium">Attendus: </span>
              {event.attendus}
            </div>
          )}
          {event.resultat && (
            <div>
              <span className="font-medium">Résultat: </span>
              {event.resultat}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
