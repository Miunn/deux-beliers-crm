import { AppSidebar } from "@/components/common/sidebar/AppSidebar";
import SidebarLayoutHeader from "@/components/layout/SidebarHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function NewLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<SidebarLayoutHeader title="Gestion clients" className="max-w-full w-full shrink-0" />
				<div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
					<main className="relative mx-auto h-full w-full max-w-full font-sans p-4">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
