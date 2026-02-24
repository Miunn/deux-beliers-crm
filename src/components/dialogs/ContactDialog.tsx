"use client";

import { useForm } from "react-hook-form";
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
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NEW_CONTACT_FORM_SCHEMA } from "@/lib/definitions";
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
import { Loader2, Plus } from "lucide-react";
import { createContact, updateContact } from "@/actions/contacts";
import { toast } from "sonner";
import { useActivites } from "@/hooks/use-activites";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import CreateActivite from "../sheet/CreateActivite";
import { useState } from "react";
import {
	ContactWithRelations,
	useContactsContext,
} from "@/context/ContactsContext";
import ArchiveDialog from "./ArchiveDialog";
import { useKanbanColumns } from "@/hooks/kanban/use-columns";

export default function ContactDialog({
	mode,
	contact,
	open,
	onOpenChange,
	children,
}: {
	mode: "create" | "edit";
	contact?: ContactWithRelations;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const { data: activites } = useActivites();
	const [isOpen, setIsOpen] = useState(open ?? false);
	const internalOpen = open ?? isOpen;
	const internalOnOpenChange = onOpenChange ?? setIsOpen;
	const [createActiviteOpen, setCreateActiviteOpen] = useState(false);
	const { addOrUpdateContact } = useContactsContext();
	const { data: kanbanColumns } = useKanbanColumns();

	const form = useForm<z.infer<typeof NEW_CONTACT_FORM_SCHEMA>>({
		resolver: zodResolver(NEW_CONTACT_FORM_SCHEMA),
		defaultValues: {
			nom: contact?.nom ?? "",
			activite: contact?.activite?.id ?? "",
			ville: contact?.ville ?? "",
			contact: contact?.contact ?? "",
			telephone: contact?.telephone ?? "",
			mail: contact?.mail ?? "",
			observations: contact?.observations ?? "",
			adresse: contact?.adresse ?? "",
			horaires: contact?.horaires ?? "",
			kanbanColumnId:
				contact?.kanbanColumnId ?? kanbanColumns?.[0]?.id ?? "1",
			active: true,
		},
	});

	const onSubmit = async (data: z.infer<typeof NEW_CONTACT_FORM_SCHEMA>) => {
		const res =
			mode === "edit" && contact
				? await updateContact(contact.id, data)
				: await createContact(data);

		if (res && "error" in res) {
			toast.error(res.error);
		} else {
			toast.success(
				mode === "edit"
					? "Contact mis à jour avec succès"
					: "Contact enregistré avec succès",
			);
			internalOnOpenChange(false);
			// ensure returned contact has relations (actions return with include)
			addOrUpdateContact(res as ContactWithRelations);
			if (mode === "create") form.reset();
		}
	};

	return (
		<>
			<Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
				{children ? (
					<DialogTrigger asChild>{children}</DialogTrigger>
				) : null}
				<DialogContent className="flex flex-col gap-0 p-0 min-w-[55%] sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
					<DialogHeader className="contents space-y-0 text-left">
						<DialogTitle className="border-b px-6 py-4 text-base">
							{mode === "edit"
								? "Modifier le contact"
								: "Ajouter un contact"}
						</DialogTitle>
						<div className="overflow-y-auto">
							<div className="p-6">
								<Form {...form}>
									<form
										className="grid grid-cols-1 md:grid-cols-2 gap-4"
										onSubmit={form.handleSubmit(onSubmit)}
									>
										<div className="space-y-4">
											<FormField
												control={form.control}
												name="nom"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Nom
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="activite"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Activité
														</FormLabel>
														<div className="flex items-center gap-2">
															<Select
																onValueChange={
																	field.onChange
																}
																defaultValue={
																	field.value
																}
															>
																<FormControl>
																	<SelectTrigger className="flex-1">
																		<SelectValue placeholder="Activité" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{activites?.map(
																		(
																			activite,
																		) => (
																			<SelectItem
																				key={
																					activite.id
																				}
																				value={
																					activite.id
																				}
																			>
																				{
																					activite.label
																				}
																			</SelectItem>
																		),
																	)}
																</SelectContent>
															</Select>

															<Button
																variant={
																	"outline"
																}
																size={"icon"}
																type="button"
																onClick={() =>
																	setCreateActiviteOpen(
																		true,
																	)
																}
															>
																<Plus className="w-4 h-4" />
															</Button>
														</div>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="ville"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Ville
														</FormLabel>
														<FormControl>
															<Input
																placeholder="Nantes"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="contact"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Contact
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="telephone"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Téléphone
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="mail"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Email
														</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="adresse"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Adresse postale
														</FormLabel>
														<FormControl>
															<Textarea
																rows={3}
																placeholder="30 rue de la Paix, 44000 Nantes"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="horaires"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Horaires
														</FormLabel>
														<FormControl>
															<Textarea
																rows={3}
																placeholder="Lundi à vendredi de 9h à 18h"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="flex flex-col gap-4">
											<FormField
												control={form.control}
												name="kanbanColumnId"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Kanban colonne
														</FormLabel>
														<Select
															value={field.value}
															onValueChange={
																field.onChange
															}
														>
															<FormControl>
																<SelectTrigger className="w-full">
																	<SelectValue />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{kanbanColumns?.map(
																	(col) => (
																		<SelectItem
																			key={
																				col.id
																			}
																			value={
																				col.id
																			}
																		>
																			{
																				col.name
																			}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="observations"
												render={({ field }) => (
													<FormItem className="flex-1 flex flex-col gap-2">
														<FormLabel className="h-fit">
															Observations
														</FormLabel>
														<FormControl>
															<Textarea
																className="h-full"
																{...field}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</form>
								</Form>
							</div>
						</div>
					</DialogHeader>
					<DialogFooter className="items-center border-t px-6 py-4">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Annuler
							</Button>
						</DialogClose>
						{contact ? (
							<ArchiveDialog contact={contact}>
								<Button variant={"outline"}>Archiver</Button>
							</ArchiveDialog>
						) : null}
						<DialogClose asChild>
							<Button
								type="submit"
								onClick={form.handleSubmit(onSubmit)}
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
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<CreateActivite
				open={createActiviteOpen}
				onOpenChange={setCreateActiviteOpen}
			/>
		</>
	);
}
