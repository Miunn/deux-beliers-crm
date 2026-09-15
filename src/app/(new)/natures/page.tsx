import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ManageNaturesContent from "@/components/natures/ManageNaturesContent";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
