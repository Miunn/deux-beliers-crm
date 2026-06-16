"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
	Archive,
	Calendar1,
	Download,
	GalleryVerticalEnd,
	LayoutList,
	SaveAll,
	Settings,
	SquareKanban,
	Tags,
	Undo2,
	Upload,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
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

function isNavActive(pathname: string, href: string) {
	return href === "/" ? pathname === "/" : pathname === href;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent focus:bg-transparent active:bg-transparent"
						>
							<Link href={"/new"} className={"flex items-center gap-2"}>
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
							<SidebarMenuButton asChild isActive={isNavActive(pathname, "/new")} tooltip={"Cartes"}>
								<Link href={"/new"}>
									<GalleryVerticalEnd /> <span>Cartes</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={isNavActive(pathname, "/table")} tooltip={"Tableau"}>
								<Link href={"/table"}>
									<LayoutList /> <span>Tableau</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={isNavActive(pathname, "/new/kanban")}
								tooltip={"Kanban"}
							>
								<Link href={"/new/kanban"}>
									<SquareKanban /> <span>Kanban</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Contenu</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={isNavActive(pathname, "/tags")} tooltip={"Libellés"}>
								<Link href={"/tags"}>
									<Tags /> <span>Libellés</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={isNavActive(pathname, "/natures")}
								tooltip={"Natures d'évènements"}
							>
								<Link href={"/natures"}>
									<Calendar1 /> <span>Natures d&apos;évènements</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Données</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={isNavActive(pathname, "/import")} tooltip={"Importer"}>
								<Link href={"/import"}>
									<Upload /> <span>Importer</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={isNavActive(pathname, "/export")} tooltip={"Exporter"}>
								<Link href={"/export"}>
									<Download /> <span>Exporter</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Divers</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={isNavActive(pathname, "/new/archive")}
								tooltip={"Archives"}
							>
								<Link href={"/new/archive"}>
									<Archive /> <span>Archives</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={isNavActive(pathname, "/saves")}
								tooltip={"Sauvegardes"}
							>
								<Link href={"/saves"}>
									<SaveAll /> <span>Sauvegardes</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={isNavActive(pathname, "/settings")}
								tooltip={"Paramètres"}
							>
								<Link href={"/settings"}>
									<Settings /> <span>Paramètres</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip={"Ancienne vue"}>
							<Link href={"/"}>
								<Undo2 /> <span>Retour à l&apos;ancienne vue</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
