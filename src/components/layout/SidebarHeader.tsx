"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../ui/sidebar";

function pathToTitle(path: string): string {
	switch (path) {
		case "/dashboard":
			return "Tableau de bord";
		case "/new":
			return "Clients";
		case "/table":
			return "Tableau";
		case "/new/kanban":
			return "Kanban";
		case "/archive":
			return "Archivés";
		case "/tags":
			return "Libellés";
		case "/natures":
			return "Natures d'évènements";
		case "/import":
			return "Importer des données";
		case "/export":
			return "Exporter des données";
		case "/new/archive":
			return "Clients archivés";
		case "/saves":
			return "Sauvegardes de données";
		case "/settings":
			return "Paramètres";
		case "/changelog":
			return "Changelog";
		default:
			return "";
	}
}

export default function SidebarLayoutHeader({ className }: { title: string; className?: string }) {
	const pathname = usePathname();

	return (
		<header className="bg-background p-4 z-10 border-b">
			<div
				className={cn(
					"container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
					className,
				)}
			>
				<div className="flex items-center gap-3">
					<SidebarTrigger />
					<span>
						{pathToTitle(pathname)} <span id="header-contact-count" />
					</span>
				</div>
				{/*<div className="flex items-center gap-3 w-full md:w-auto">
					<nav className="whitespace-nowrap flex items-center flex-wrap gap-3">
						<Button variant={"link"} className="cursor-pointer text-white">
							Paramètres
						</Button>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className={cn(pathname === "/table" ? "bg-accent" : "")}
									asChild
								>
									<Link href={"/table"}>
										<LayoutList />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Tableau</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className={cn(pathname === "/kanban" ? "bg-accent" : "")}
									asChild
								>
									<Link href={"/kanban"}>
										<SquareKanban />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Kanban</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className={cn(
										"cursor-pointer text-primary",
										pathname === "/archive" ? "bg-accent" : "",
									)}
									asChild
								>
									<Link href="/archive">
										<Archive />
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Archivés</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={() => setLabelsOpen(true)}
									variant={"ghost"}
									size={"icon"}
									className="cursor-pointer text-primary"
								>
									<Tags />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Libellés</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={() => setNaturesOpen(true)}
									variant={"ghost"}
									size={"icon"}
									className="cursor-pointer text-primary"
								>
									<Calendar1 />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Natures d&apos;évènements</TooltipContent>
						</Tooltip>
						<input
							id={fileInputId}
							type="file"
							accept=".xlsx,.xls"
							className="hidden"
							onChange={async (e) => {
								const input = e.currentTarget;
								const file = input.files?.[0];
								if (!file) return;
								setImporting(true);
								setImportError(null);
								setImportDetails([]);
								try {
									const fd = new FormData();
									fd.append("file", file);
									const res = await fetch("/api/contacts/import", {
										method: "POST",
										body: fd,
									});
									if (!res.ok) {
										let message = "Import échoué";
										let details: string[] = [];
										try {
											const json = await res.json();
											message = json?.error || message;
											details = Array.isArray(json?.details) ? json.details : [];
										} catch {}
										setImportError(message);
										setImportDetails(details);
									} else {
										// Hard reload to revalidate and refresh all data/UI
										window.location.reload();
									}
								} catch (e) {
									console.log("Import error:", e);
									setImportError("Import échoué");
								} finally {
									setImporting(false);
									// reset input to allow reselecting same file
									input.value = "";
								}
							}}
						/>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									className="cursor-pointer text-primary"
									size={"icon"}
									onClick={() => document.getElementById(fileInputId)?.click()}
									disabled={importing}
								>
									{importing ? <Loader2 className="animate-spin" /> : <Upload />}
								</Button>
							</TooltipTrigger>
							<TooltipContent>Importer</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size={"icon"}
									variant={"ghost"}
									className="cursor-pointer text-primary"
									onClick={async () => {
										const res = await fetch("/api/contacts/export");
										if (!res.ok) return;
										const blob = await res.blob();
										const url = URL.createObjectURL(blob);
										const a = document.createElement("a");
										a.href = url;
										a.download = "contacts.xlsx";
										document.body.appendChild(a);
										a.click();
										a.remove();
										URL.revokeObjectURL(url);
									}}
								>
									<Download />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Exporter</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant={"ghost"} size={"icon"} className="cursor-pointer text-primary">
											<User />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem onClick={() => setAccountOpen(true)}>
											<User />
											Compte
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												authClient.signOut({
													fetchOptions: {
														onSuccess: () => {
															router.push("/sign-in");
														},
													},
												})
											}
										>
											<LogOut />
											Se déconnecter
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TooltipTrigger>
							<TooltipContent>Compte</TooltipContent>
						</Tooltip>
					</nav>
				</div>*/}
			</div>
		</header>
	);
}
