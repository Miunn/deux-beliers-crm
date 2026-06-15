"use client";

import { ACCOUNT_FORM_SCHEMA } from "@/lib/definitions";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form, FormControl, FormLabel, FormItem, FormField, FormMessage } from "../ui/form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function AccountContent() {
	const { data: session } = authClient.useSession();
	const form = useForm<z.infer<typeof ACCOUNT_FORM_SCHEMA>>({
		resolver: zodResolver(ACCOUNT_FORM_SCHEMA),
		defaultValues: {
			currentPassword: "",
			password: "",
			passwordConfirmation: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof ACCOUNT_FORM_SCHEMA>) => {
		if (data.password && data.currentPassword) {
			await authClient.changePassword({
				newPassword: data.password,
				currentPassword: data.currentPassword,
				fetchOptions: {
					onError: (error) => {
						toast.error(error.error.message);
					},
					onSuccess: () => {
						toast.success("Mot de passe mis à jour");
						form.reset();
					},
				},
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
				<div className="space-y-6">
					<div className="space-y-3">
						<Label htmlFor="name">Nom</Label>
						<Input className="cursor-not-allowed" disabled defaultValue={session?.user.name} id="name" />
					</div>

					<div className="space-y-3">
						<Label htmlFor="email">Email</Label>
						<Input className="cursor-not-allowed" disabled defaultValue={session?.user.email} id="email" />
					</div>
				</div>

				<div className="space-y-6 pt-6 border-t">
					<p className="text-sm font-medium">Mot de passe</p>

					<FormField
						control={form.control}
						name="currentPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Mot de passe actuel</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="Mot de passe actuel"
										autoComplete="current-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nouveau mot de passe</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="•••••••••••"
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="passwordConfirmation"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirmation du mot de passe</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="•••••••••••"
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? (
						<>
							<Loader2 className="animate-spin" />
							Enregistrement...
						</>
					) : (
						"Enregistrer"
					)}
				</Button>
			</form>
		</Form>
	);
}
