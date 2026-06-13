"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";
import { Input } from "./input";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	initialSorting?: SortingState;
}

export function DataTable<TData, TValue>({ columns, data, initialSorting = [] }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		state: { sorting, columnFilters, globalFilter },
		globalFilterFn: "includesString",
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center">
				<Input
					placeholder="Filtrer les contacts"
					value={globalFilter}
					onChange={(event) => table.setGlobalFilter(event.target.value)}
					className="max-w-sm"
				/>
			</div>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const className = header.column.columnDef.meta?.className;
									const canSort = header.column.getCanSort();
									const sorted = header.column.getIsSorted();

									return (
										<TableHead
											key={header.id}
											className={cn(className, header.column.id === "actions" && "text-right")}
										>
											{header.isPlaceholder ? null : canSort ? (
												<button
													type="button"
													onClick={header.column.getToggleSortingHandler()}
													className={cn(
														"inline-flex items-center gap-1 hover:text-foreground transition-colors -ml-1 px-1 rounded-md",
														sorted ? "text-foreground" : "text-muted-foreground",
													)}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{sorted === "asc" ? (
														<ArrowUp className="size-3.5 shrink-0" />
													) : sorted === "desc" ? (
														<ArrowDown className="size-3.5 shrink-0" />
													) : null}
												</button>
											) : header.column.id === "actions" ? (
												<span className="text-muted-foreground font-medium">Actions</span>
											) : (
												flexRender(header.column.columnDef.header, header.getContext())
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									data-contact-id={(row.original as { id?: string }).id ?? row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												cell.column.columnDef.meta?.className,
												cell.column.id === "actions" && "text-right",
											)}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Aucun contact
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
