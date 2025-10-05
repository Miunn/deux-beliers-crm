"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { addMonths } from "date-fns";

export default function ReminderDateDialog({
  open,
  onOpenChange,
  defaultDate,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  onConfirm: (date: Date) => void;
}) {
  const [dateStr, setDateStr] = useState(
    (defaultDate ?? addMonths(new Date(), 1)).toISOString().slice(0, 10)
  );

  useEffect(() => {
    setDateStr((defaultDate ?? new Date()).toISOString().slice(0, 10));
  }, [defaultDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choisir la date du rappel</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date du rappel</label>
          <Input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            onClick={() => {
              const d = dateStr ? new Date(dateStr) : new Date();
              onConfirm(d);
              onOpenChange(false);
            }}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
