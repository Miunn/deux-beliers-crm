"use client";

import { columns } from "./columns";
import { DataTable } from "../ui/data-table";
import { ContactWithRelations } from "@/types/contact-types";

export default function ContactTable({ data }: { data?: ContactWithRelations[] }) {
	return <DataTable columns={columns} data={data ?? []} initialSorting={[{ id: "rappel", desc: false }]} />;
}
