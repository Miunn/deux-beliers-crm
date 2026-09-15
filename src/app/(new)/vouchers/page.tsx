import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import VouchersContent from "@/components/vouchers/VouchersContent";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function VouchersPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	return (
		<div className="mx-auto flex-1 relative font-sans p-4 max-w-[1520px]">
			<h2 className="text-lg font-medium mb-6">Bons de visite</h2>
			<VouchersContent />
		</div>
	);
}
