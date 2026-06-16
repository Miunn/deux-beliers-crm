import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ManageNaturesContent from "@/components/natures/ManageNaturesContent";

export default async function NaturesPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	return (
		<div className="mx-auto flex-1 relative font-sans p-4 max-w-2xl">
			<h2 className="text-lg font-medium mb-6">Gérer les natures d&apos;événement</h2>
			<ManageNaturesContent />
		</div>
	);
}
