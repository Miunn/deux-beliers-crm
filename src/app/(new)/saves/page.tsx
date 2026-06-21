import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SavesContent from "@/components/saves/SavesContent";

export default async function SavesPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	return (
		<div className="mx-auto flex-1 relative font-sans p-4 max-w-3xl">
			<h2 className="text-lg font-medium mb-6">Sauvegardes</h2>
			<SavesContent />
		</div>
	);
}
