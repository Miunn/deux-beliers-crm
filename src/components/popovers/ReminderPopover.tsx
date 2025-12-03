import { Bell, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import CalendarPresets from "../ui/calendar-presets";
import { useState } from "react";
import { setReminder } from "@/actions/contacts";
import { toast } from "sonner";
import {
  ContactWithRelations,
  useContactsContext,
} from "@/context/ContactsContext";

export default function ReminderPopover({
  contact,
}: {
  contact: ContactWithRelations;
}) {
  const [date, setDate] = useState<Date | undefined>(
    contact.rappel || undefined,
  );
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const { addOrUpdateContact } = useContactsContext();

  const save = async () => {
    if (!date) {
      return;
    }

    setSaving(true);
    const r = await setReminder(contact.id, date);
    setSaving(false);

    if (r.success) {
      // Blur any active element so focus doesn't jump back to the popover trigger
      // when we close it. Browsers may scroll focused elements into view which
      // causes the viewport to jump on reorder — removing focus prevents that.
      try {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      } catch (e) {
        // ignore environments without a DOM
      }

      // Update the contact in context after blur to avoid scroll jumps.
      addOrUpdateContact({ ...contact, rappel: date });

      setOpen(false);
      toast.success("Rappel enregistré");
      return;
    }

    if (r.error) {
      toast.error(`Erreur: ${r.error}`);
      return;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <Bell />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden"
        align="start"
        onCloseAutoFocus={(e) => {
          // Prevent Radix from moving focus back to the trigger when the popover closes.
          // Returning focus to the trigger can cause the page to jump (scroll) — prevent that.
          e.preventDefault();
        }}
      >
        <CalendarPresets
          date={date}
          setDate={setDate}
          className="border-0"
          calendarProps={{
            disabled: (date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0)),
          }}
        />
        <div className="flex justify-between items-center">
          <p className="p-4 text-sm">
            Rappel le:{" "}
            {date ? date.toLocaleDateString() : <i>Aucune date sélectionnée</i>}
          </p>
          <Button className="ml-auto" onClick={save} disabled={saving || !date}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement
              </>
            ) : (
              <>Enregistrer</>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
