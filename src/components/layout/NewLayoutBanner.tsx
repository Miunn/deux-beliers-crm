"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { XIcon } from "lucide-react";
import { Button } from "../ui/button";

const STORAGE_KEY = "new-layout-banner-dismissed";
const LEGACY_PATHS = new Set(["/", "/kanban", "/archive"]);

export default function NewLayoutBanner() {
	const pathname = usePathname();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!LEGACY_PATHS.has(pathname)) return;
		setVisible(localStorage.getItem(STORAGE_KEY) !== "true");
	}, [pathname]);

	const dismiss = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			role="status"
			className="relative flex w-full items-center justify-center gap-2 border-b border-primary/20 bg-primary/80 px-10 py-1.5 text-sm text-primary-foreground"
		>
			<p className="text-center">
				🎉 Nouvelle interface disponible{" "}
				<Link href="/new" className="font-medium underline underline-offset-2 hover:opacity-90">
					y aller →
				</Link>
			</p>
			<Button
				variant="ghost"
				size="icon-sm"
				className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
				onClick={dismiss}
				aria-label="Fermer l'annonce"
			>
				<XIcon />
			</Button>
		</div>
	);
}
