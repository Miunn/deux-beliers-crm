"use client";

import * as React from "react";
import {
	Calendar1,
	Download,
	GalleryVerticalEnd,
	LayoutList,
	SaveAll,
	Settings,
	SquareKanban,
	Tags,
	Upload,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

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
				<SidebarGroup>
					<SidebarGroupLabel>Vues</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Cartes"}>
								<a href={"/"}>
									<GalleryVerticalEnd /> <span>Cartes</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Tableau"}>
								<a href={"/table"}>
									<LayoutList /> <span>Tableau</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Kanban"}>
								<a href={"/kanban"}>
									<SquareKanban /> <span>Kanban</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Contenu</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Libellés"}>
								<a href={"/tags"}>
									<Tags /> <span>Libellés</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Natures d'évènements"}>
								<a href={"/natures"}>
									<Calendar1 /> <span>Natures d&apos;évènements</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Données</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Importer"}>
								<a href={"/import"}>
									<Upload /> <span>Importer</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Exporter"}>
								<a href={"/export"}>
									<Download /> <span>Exporter</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Divers</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Sauvegardes"}>
								<a href={"/saves"}>
									<SaveAll /> <span>Sauvegardes</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={"Paramètres"}>
								<a href={"/settings"}>
									<Settings /> <span>Paramètres</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
