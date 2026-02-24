"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Pencil, Phone, Trash2 } from "lucide-react";
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
import {
	ContactWithRelations,
	useContactsContext,
} from "@/context/ContactsContext";
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
import { Label } from "../ui/label";
import { updateContact } from "@/actions/contacts";
import { useKanbanColumns } from "@/hooks/kanban/use-columns";

export default function EventDialog({
	contact,
	open,
	onOpenChange,
	children,
}: {
	contact: ContactWithRelations;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(open ?? false);
	const internalOpen = open ?? isOpen;
	const internalOnOpenChange = onOpenChange ?? setIsOpen;

	const { data: events, mutate, isLoading } = useEventsByContact(contact.id);
	const { appendEventDate, addOrUpdateContact } = useContactsContext();
	const { data: natures } = useNatures();
	const { data: kanbanColumns } = useKanbanColumns();
	const [editingEventId, setEditingEventId] = useState<string | null>(null);
	const [reminderOpen, setReminderOpen] = useState(false);
	const [localKanbanColumnId, setLocalKanbanColumnId] = useState<
		string | undefined
	>(contact.kanbanColumnId ?? undefined);

	useEffect(() => {
		setLocalKanbanColumnId(contact.kanbanColumnId ?? undefined);
	}, [contact.kanbanColumnId]);

	const form = useForm<z.infer<typeof CREATE_EVENT_FORM_SCHEMA>>({
		resolver: zodResolver(CREATE_EVENT_FORM_SCHEMA),
		defaultValues: {
			date: new Date(),
			natureId: "",
			commentaires: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>) => {
		const res = editingEventId
			? await updateEvent(editingEventId, data)
			: await createEvent(contact.id, data);
		if ("error" in res) {
			toast.error(res.error);
		} else {
			toast.success(
				editingEventId ? "Événement mis à jour" : "Événement créé",
			);
			// Optimistic: ensure date-filter sees this immediately
			appendEventDate(contact.id, data.date);
			mutate();
			setEditingEventId(null);
			form.reset({
				date: new Date(),
				natureId: "",
				commentaires: "",
			});
			internalOnOpenChange(false);
		}
	};

	const renderEvent = (e: Event & { nature: Nature | null }) => (
		<div
			key={e.id}
			className={cn(
				"relative group max-w-full rounded-md border p-3 text-sm space-y-1",
				"cursor-default",
				editingEventId === e.id && "bg-muted outline",
			)}
			onClick={() => {
				setEditingEventId(e.id);
				form.reset({
					date: new Date(e.date),
					natureId: e.natureId ?? "",
					commentaires: e.commentaires ?? "",
				});
			}}
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
						commentaires: e.commentaires ?? "",
					});
				}}
			>
				<Pencil className="size-3" />
			</Button>
			<div className="font-medium">
				{new Date(e.date).toLocaleString().slice(undefined, -3)}{" "}
				{e.natureId ? `• ${e.nature?.label}` : ""}
			</div>
			{e.commentaires && <p>{e.commentaires}</p>}
		</div>
	);

	const dateToDatetimeLocal = (date: Date) => {
		const pad = (n: number) => n.toString().padStart(2, "0");
		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	return (
		<>
			<Dialog
				open={internalOpen}
				onOpenChange={(open) => {
					if (!open) {
						addOrUpdateContact({
							id: contact.id,
							kanbanColumnId:
								localKanbanColumnId ?? contact.kanbanColumnId,
						});
					}
					internalOnOpenChange(open);
				}}
				modal={true}
			>
				{children ? (
					<DialogTrigger asChild>{children}</DialogTrigger>
				) : null}
				<DialogContent
					onCloseAutoFocus={(e) => e.preventDefault()}
					className="flex flex-col gap-0 p-0 w-[85%] h-full sm:max-h-[min(640px,80vh)] sm:max-w-5xl [&>button:last-child]:top-3.5"
				>
					<DialogHeader className="contents space-y-0 text-left">
						<DialogTitle className="border-b px-6 py-4 text-base">
							Suivi des événements - {events?.contact.nom} -{" "}
							<Phone
								className="inline size-4"
								strokeWidth={2.5}
							/>{" "}
							{events?.contact.telephone || "N/A"}
						</DialogTitle>
						<div className="relative overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<div className="text-sm text-muted-foreground">
									Historique
								</div>
								{isLoading && (
									<div className="text-sm">Chargement…</div>
								)}
								{events?.events.length === 0 && (
									<div className="text-sm text-muted-foreground">
										Aucun événement.
									</div>
								)}
								{events?.events.map((e) => renderEvent(e))}
							</div>

							<div className="w-full h-full row-start-1 md:row-start-auto md:col-start-2">
								<div className="sticky top-0 right-0 space-y-4">
									<Form {...form}>
										<form
											className="space-y-4"
											onSubmit={form.handleSubmit(
												onSubmit,
											)}
										>
											<FormField
												control={form.control}
												name="date"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Date
														</FormLabel>
														<FormControl>
															<Input
																type="datetime-local"
																value={
																	field.value
																		? dateToDatetimeLocal(
																				field.value,
																			)
																		: ""
																}
																onChange={(e) =>
																	field.onChange(
																		new Date(
																			e
																				.target
																				.value,
																		),
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
												name="natureId"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Nature
														</FormLabel>
														<FormControl>
															<Select
																value={
																	field.value
																}
																onValueChange={
																	field.onChange
																}
															>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Choisir une nature" />
																</SelectTrigger>
																<SelectContent>
																	{natures?.map(
																		(n) => (
																			<SelectItem
																				key={
																					n.id
																				}
																				value={
																					n.id
																				}
																			>
																				{
																					n.label
																				}
																			</SelectItem>
																		),
																	)}
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="commentaires"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Commentaires
														</FormLabel>
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

											<div className="space-y-2">
												<Label
													htmlFor="kanban-select"
													className="text-nowrap"
												>
													Kanban colonne
												</Label>
												<Select
													value={localKanbanColumnId}
													onValueChange={(val) => {
														// Update local state so the Select inside the dialog reflects the choice
														// but avoid updating the shared ContactsContext immediately to prevent
														// the card from being moved/unmounted (which would close the dialog).
														setLocalKanbanColumnId(
															val,
														);

														// Persist change to server. Do NOT call addOrUpdateContact here to avoid
														// immediate UI reordering that would unmount this dialog.
														updateContact(
															contact.id,
															{
																nom: contact.nom,
																mail:
																	contact.mail ??
																	"",
																kanbanColumnId:
																	val,
															},
														);
													}}
												>
													<SelectTrigger className="w-full">
														<SelectValue id="kanban-select" />
													</SelectTrigger>
													<SelectContent>
														{kanbanColumns?.map(
															(col) => (
																<SelectItem
																	key={col.id}
																	value={
																		col.id
																	}
																>
																	{col.name}
																</SelectItem>
															),
														)}
													</SelectContent>
												</Select>
											</div>

											<div className="flex justify-end flex-wrap-reverse gap-2">
												<Button
													type="button"
													variant="outline"
													onClick={() => {
														if (editingEventId) {
															setEditingEventId(
																null,
															);
														} else {
															internalOnOpenChange(
																false,
															);
														}
														form.reset({
															date: new Date(),
															natureId: "",
															commentaires: "",
														});
													}}
												>
													Annuler
												</Button>
												<Button
													type="button"
													variant="outline"
													disabled={
														form.formState
															.isSubmitting
													}
													onClick={() =>
														setReminderOpen(true)
													}
												>
													{form.formState
														.isSubmitting ? (
														<>
															<Loader2 className="w-4 h-4 animate-spin" />
															Enregistrement avec
															rappel...
														</>
													) : (
														"Enregistrer avec rappel"
													)}
												</Button>

												<Button
													type="submit"
													disabled={
														form.formState
															.isSubmitting
													}
												>
													{form.formState
														.isSubmitting ? (
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
						? updateEventWithReminder(
								editingEventId,
								basePayload,
								reminderDate,
							)
						: createEventWithReminder(
								contact.id,
								basePayload,
								reminderDate,
							);

					action.then((res) => {
						if ("error" in res) {
							toast.error(res.error);
						} else {
							toast.success("Événement et rappel enregistrés");
						}
						mutate();

						// Close the dialog first so Radix doesn't attempt to restore focus to the trigger
						// while we update the contacts list. Prevents focus-driven scrolling.
						internalOnOpenChange(false);

						// Defer the context update so the dialog close / focus plumbing finishes
						// before ContactList's anchor-preservation runs. Also blur the active element
						// to avoid focus-based scrolls (matches behaviour in ReminderPopover).
						setTimeout(() => {
							try {
								if (
									document.activeElement instanceof
									HTMLElement
								) {
									document.activeElement.blur();
								}
							} catch {
								// ignore environments without a DOM
							}

							addOrUpdateContact({
								id: contact.id,
								rappel: reminderDate,
							});
						}, 0);

						setEditingEventId(null);
						form.reset({
							date: new Date(),
							natureId: "",
							commentaires: "",
						});
					});
				}}
			/>
		</>
	);
}
