"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CREATE_EVENT_FORM_SCHEMA } from "@/lib/definitions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import DeleteEvent from "./DeleteEvent";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createEvent,
  updateEvent,
  createEventWithReminder,
  updateEventWithReminder,
} from "@/actions/events";
import ReminderDateDialog from "./ReminderDateDialog";
import { useEventsByContact } from "@/hooks/use-events";
import { useNatures } from "@/hooks/use-natures";
import { Event, Nature } from "../../../generated/prisma";
import { cn } from "@/lib/utils";
import { addMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function EventDialog({
  contactId,
  open,
  onOpenChange,
  children,
}: {
  contactId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const internalOpen = open ?? isOpen;
  const internalOnOpenChange = onOpenChange ?? setIsOpen;

  const { data: events, mutate, isLoading } = useEventsByContact(contactId);
  const { data: natures } = useNatures();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);

  const form = useForm<z.infer<typeof CREATE_EVENT_FORM_SCHEMA>>({
    resolver: zodResolver(CREATE_EVENT_FORM_SCHEMA),
    defaultValues: {
      date: new Date(),
      natureId: "",
      attendus: "",
      date_traitement: undefined,
      resultat: "",
    },
  });

  const onSubmit = (data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>) => {
    const action = editingEventId
      ? updateEvent(editingEventId, data)
      : createEvent(contactId, data);
    action.then((res) => {
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success(
          editingEventId ? "Événement mis à jour" : "Événement créé"
        );
        mutate();
        setEditingEventId(null);
        form.reset({
          date: new Date(),
          natureId: "",
          attendus: "",
          date_traitement: undefined,
          resultat: "",
        });
      }
    });
  };

  const renderEvent = (e: Event & { nature: Nature | null }) => (
    <div
      key={e.id}
      className={cn(
        "relative group rounded-md border p-3 text-sm space-y-1",
        editingEventId === e.id && "bg-muted outline"
      )}
    >
      <DeleteEvent event={e} onDeleted={() => mutate()}>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 hover:bg-transparent p-0 absolute top-0 right-0"
        >
          <Trash2 className="size-3" />
        </Button>
      </DeleteEvent>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent p-0 absolute top-0 right-7"
        title="Modifier"
        onClick={() => {
          setEditingEventId(e.id);
          form.reset({
            date: new Date(e.date),
            natureId: e.natureId ?? "",
            attendus: e.attendus ?? "",
            date_traitement: e.date_traitement
              ? new Date(e.date_traitement)
              : undefined,
            resultat: e.resultat ?? "",
          });
        }}
      >
        <Pencil className="size-3" />
      </Button>
      <div className="font-medium">
        {new Date(e.date).toLocaleDateString()}{" "}
        {e.natureId ? `• ${e.nature?.label}` : ""}
      </div>
      {e.attendus && <div>Attendus: {e.attendus}</div>}
      {e.date_traitement && (
        <div>
          Traitement: {new Date(e.date_traitement).toLocaleDateString()}
        </div>
      )}
      {e.resultat && <div>Résultat: {e.resultat}</div>}
    </div>
  );

  return (
    <>
      <Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
        {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
        <DialogContent className="flex flex-col gap-0 p-0 min-w-[55%] h-full sm:max-h-[min(640px,80vh)] sm:max-w-2xl [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Suivi des événements
            </DialogTitle>
            <div className="overflow-y-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Historique
                  </div>
                  {isLoading && <div className="text-sm">Chargement…</div>}
                  {events?.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Aucun événement.
                    </div>
                  )}
                  {events?.map((e) => renderEvent(e))}
                </div>

                <div className="h-full space-y-4">
                  <Form {...form}>
                    <form
                      className="space-y-4"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .slice(0, 10)
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="natureId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nature</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choisir une nature" />
                                </SelectTrigger>
                                <SelectContent>
                                  {natures?.map((n) => (
                                    <SelectItem key={n.id} value={n.id}>
                                      {n.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="attendus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendus</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[100px] resize-y field-sizing-fixed"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date_traitement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de traitement</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .slice(0, 10)
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resultat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Résultat</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[100px] resize-y field-sizing-fixed"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingEventId(null);
                            form.reset({
                              date: new Date(),
                              natureId: "",
                              attendus: "",
                              date_traitement: undefined,
                              resultat: "",
                            });
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={form.formState.isSubmitting}
                          onClick={() => setReminderOpen(true)}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enregistrement avec rappel...
                            </>
                          ) : (
                            "Enregistrer avec rappel"
                          )}
                        </Button>

                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            "Enregistrer"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </DialogHeader>
          {/* <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter> */}
        </DialogContent>
      </Dialog>

      <ReminderDateDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        defaultDate={
          addMonths(form.getValues("date") as Date, 1) ??
          addMonths(new Date(), 1)
        }
        onConfirm={(reminderDate) => {
          const basePayload = form.getValues() as z.infer<
            typeof CREATE_EVENT_FORM_SCHEMA
          >;

          const action = editingEventId
            ? updateEventWithReminder(editingEventId, basePayload, reminderDate)
            : createEventWithReminder(contactId, basePayload, reminderDate);

          action.then((res) => {
            if ("error" in res) {
              toast.error(res.error);
            } else {
              toast.success("Événement et rappel enregistrés");
            }
            mutate();
            setEditingEventId(null);
            form.reset({
              date: new Date(),
              natureId: "",
              attendus: "",
              date_traitement: undefined,
              resultat: "",
            });
          });
        }}
      />
    </>
  );
}
