"use client";

import { useState } from "react";
import { useLabels } from "@/hooks/use-labels";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CREATE_LABEL_FORM_SCHEMA } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { createLabel, deleteLabel, updateLabel } from "@/actions/labels";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
	EllipsisVertical,
	Loader2,
	Pencil,
	Save,
	Trash,
	X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableStatusRow } from "@/components/ui/table-status-row";

export default function ManageLabelsContent() {
	const { data: labels, isLoading, mutate } = useLabels();
	const [submittingId, setSubmittingId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editLabel, setEditLabel] = useState<string>("");
	const [editColor, setEditColor] = useState<string>("#4f46e5");

	const form = useForm<z.infer<typeof CREATE_LABEL_FORM_SCHEMA>>({
		resolver: zodResolver(CREATE_LABEL_FORM_SCHEMA),
		defaultValues: { label: "", color: "#4f46e5" },
	});

	const onSubmit = async (data: z.infer<typeof CREATE_LABEL_FORM_SCHEMA>) => {
		const res = await createLabel(data);
		if ("error" in res) {
			toast.error(res.error);
		} else {
			toast.success("Libellé créé");
			form.reset({ label: "", color: form.getValues("color") || "#4f46e5" });
			mutate();
		}
	};

	const handleDelete = async (id: string) => {
		setSubmittingId(id);
		const res = await deleteLabel(id);
		if ("error" in res) {
			toast.error(res.error);
		} else {
			toast.success("Libellé supprimé");
			mutate();
		}
		setSubmittingId(null);
	};

	const startEdit = (id: string, label: string, color: string) => {
		setEditingId(id);
		setEditLabel(label);
		setEditColor(color);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditLabel("");
		setEditColor("#4f46e5");
	};

	const saveEdit = async () => {
		if (!editingId) return;
		setSubmittingId(editingId);
		const validated = CREATE_LABEL_FORM_SCHEMA.safeParse({
			label: editLabel,
			color: editColor,
		});
		if (!validated.success) {
			toast.error(validated.error.message);
			setSubmittingId(null);
			return;
		}
		const res = await updateLabel(editingId, validated.data);
		if ("error" in res) toast.error(res.error);
		else {
			toast.success("Libellé mis à jour");
			await mutate();
			cancelEdit();
		}
		setSubmittingId(null);
	};

	return (
		<div className="space-y-6">
			<form className="flex items-center gap-3" onSubmit={form.handleSubmit(onSubmit)}>
				<Input
					placeholder="Nom du libellé"
					aria-invalid={!!form.formState.errors.label}
					{...form.register("label")}
				/>
				<Input
					type="color"
					aria-label="Couleur"
					className="h-9 w-12 rounded-md border-none p-0"
					{...form.register("color")}
				/>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Ajout..." : "Ajouter"}
				</Button>
			</form>
			{form.formState.errors.label && (
				<p className="text-sm text-red-600">{form.formState.errors.label.message}</p>
			)}
			{form.formState.errors.color && (
				<p className="text-sm text-red-600">{form.formState.errors.color.message}</p>
			)}

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Libellé</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{labels && labels.length > 0 ? (
							labels.map((l) => (
								<TableRow key={l.id}>
									<TableCell>
										{editingId === l.id ? (
											<div className="flex items-center gap-3">
												<span
													className="inline-block size-4 shrink-0 rounded"
													style={{ background: editColor }}
												/>
												<Input
													value={editLabel}
													onChange={(e) => setEditLabel(e.target.value)}
													className="flex-1"
													aria-label="Nom du libellé"
												/>
												<Input
													type="color"
													aria-label="Couleur"
													className="h-9 w-9 rounded-md border-none p-0"
													value={editColor}
													onChange={(e) => setEditColor(e.target.value)}
												/>
											</div>
										) : (
											<div className="flex items-center gap-3">
												<span
													className="inline-block size-4 rounded"
													style={{ background: l.color }}
												/>
												<span>{l.label}</span>
											</div>
										)}
									</TableCell>
									<TableCell className="text-right">
										{editingId === l.id ? (
											<div className="flex items-center justify-end gap-1">
												<Button
													type="button"
													size="icon"
													onClick={saveEdit}
													disabled={submittingId === l.id}
												>
													{submittingId === l.id ? <Loader2 className="animate-spin" /> : <Save />}
												</Button>
												<Button type="button" variant="ghost" onClick={cancelEdit} size="icon">
													<X />
												</Button>
											</div>
										) : (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														disabled={submittingId === l.id}
													>
														{submittingId === l.id ? (
															<Loader2 className="animate-spin" />
														) : (
															<EllipsisVertical />
														)}
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<DropdownMenuItem onClick={() => startEdit(l.id, l.label, l.color)}>
														<Pencil />
														Modifier
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														onClick={() => handleDelete(l.id)}
													>
														<Trash />
														Supprimer
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableStatusRow
								colSpan={2}
								isLoading={isLoading}
								emptyMessage="Aucun libellé."
							/>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
