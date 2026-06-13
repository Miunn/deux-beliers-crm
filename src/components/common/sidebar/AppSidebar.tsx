"use client";

import * as React from "react";
import {
	Calendar1,
	Download,
	GalleryVerticalEnd,
	LucideIcon,
	SaveAll,
	SquareKanban,
	SquareTerminal,
	Tags,
	Upload,
} from "lucide-react";

import { Group } from "@/components/common/sidebar/Group";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

const content: {
	[key: string]: {
		title: string;
		items: {
			title: string;
			url: string;
			icon?: LucideIcon;
			isActive?: boolean;
			items?: { title: string; url: string }[];
		}[];
	};
} = {
	vues: {
		title: "Vues",
		items: [
			{
				title: "Cartes",
				url: "/",
				icon: GalleryVerticalEnd,
			},
			{
				title: "Tableau",
				url: "/table",
				icon: SquareTerminal,
			},
			{
				title: "Kanban",
				url: "/kanban",
				icon: SquareKanban,
			},
		],
	},
	contenu: {
		title: "Contenu",
		items: [
			{
				title: "Libellés",
				url: "/labels",
				icon: Tags,
			},
			{
				title: "Natures d'évènements",
				url: "/events",
				icon: Calendar1,
			},
		],
	},
	donnees: {
		title: "Données",
		items: [
			{
				title: "Importer",
				url: "/import",
				icon: Upload,
			},
			{
				title: "Télécharger",
				url: "/download",
				icon: Download,
			},
		],
	},
	sauvegardes: {
		title: "Sauvegardes",
		items: [
			{
				title: "Sauvegardes",
				url: "/saves",
				icon: SaveAll,
			},
		],
	},
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Link href={"/"} className={"flex items-center gap-2"}>
								<Image src="/cropped-icon-gold.svg" alt="Deux Béliers" width={30} height={30} />
								<h1 className="text-xl text-primary text-nowrap font-medium">Gestion client</h1>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{Object.keys(content).map((key) => (
					<Group key={key} title={content[key].title} items={content[key].items} />
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
