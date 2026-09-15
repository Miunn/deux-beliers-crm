import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AccountContent from "@/components/settings/AccountContent";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function SettingsPage() {
	const hdrs = await headers();
	const session = await auth.api.getSession({
		headers: hdrs,
	});
	if (!session) redirect("/sign-in");

	return (
		<div className="mx-auto flex-1 relative font-sans px-6 py-8 max-w-3xl">
			<h2 className="text-lg font-medium mb-10">Informations du compte</h2>
			<AccountContent />
		</div>
	);
}
