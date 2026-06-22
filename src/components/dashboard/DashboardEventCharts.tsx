"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardEventsByMonth, DashboardEventsByNature } from "@/data/dashboard-service";

const MONTHLY_CHART_CONFIG = {
	count: {
		label: "Événements",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
] as const;

function buildNatureChartConfig(data: DashboardEventsByNature[]): ChartConfig {
	return Object.fromEntries(
		data.map((item, index) => [
			item.natureId,
			{
				label: item.label,
				color: CHART_COLORS[index % CHART_COLORS.length],
			},
		]),
	);
}

type Props = {
	eventsByMonth: DashboardEventsByMonth[];
	eventsByNature: DashboardEventsByNature[];
};

export default function DashboardEventCharts({ eventsByMonth, eventsByNature }: Props) {
	const natureChartConfig = useMemo(() => buildNatureChartConfig(eventsByNature), [eventsByNature]);
	const totalEventsByNature = eventsByNature.reduce((sum, item) => sum + item.count, 0);
	const totalEventsByMonth = eventsByMonth.reduce((sum, item) => sum + item.count, 0);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card className="py-0 gap-0">
				<CardHeader className="border-b py-4">
					<CardTitle className="text-base">Événements par mois</CardTitle>
					<CardDescription>12 derniers mois · {totalEventsByMonth} événements</CardDescription>
				</CardHeader>
				<CardContent className="px-6 py-4">
					{totalEventsByMonth === 0 ? (
						<p className="py-8 text-sm text-muted-foreground text-center">Aucun événement sur cette période.</p>
					) : (
						<ChartContainer config={MONTHLY_CHART_CONFIG} className="aspect-auto h-[260px] w-full">
							<BarChart accessibilityLayer data={eventsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									interval="preserveStartEnd"
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="count" fill="var(--color-count)" radius={4} />
							</BarChart>
						</ChartContainer>
					)}
				</CardContent>
			</Card>

			<Card className="py-0 gap-0">
				<CardHeader className="border-b py-4">
					<CardTitle className="text-base">Événements par nature</CardTitle>
					<CardDescription>12 derniers mois · {totalEventsByNature} événements</CardDescription>
				</CardHeader>
				<CardContent className="px-6 py-4">
					{totalEventsByNature === 0 ? (
						<p className="py-8 text-sm text-muted-foreground text-center">Aucun événement sur cette période.</p>
					) : eventsByNature.length <= 6 ? (
						<ChartContainer config={natureChartConfig} className="aspect-auto h-[260px] w-full">
							<PieChart>
								<ChartTooltip content={<ChartTooltipContent hideLabel nameKey="natureId" />} />
								<Pie
									data={eventsByNature}
									dataKey="count"
									nameKey="natureId"
									innerRadius={56}
									strokeWidth={2}
								>
									{eventsByNature.map((item, index) => (
										<Cell key={item.natureId} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Pie>
								<ChartLegend content={<ChartLegendContent nameKey="natureId" />} />
							</PieChart>
						</ChartContainer>
					) : (
						<ChartContainer config={natureChartConfig} className="aspect-auto h-[260px] w-full">
							<BarChart
								accessibilityLayer
								layout="vertical"
								data={eventsByNature}
								margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
							>
								<CartesianGrid horizontal={false} />
								<YAxis
									dataKey="label"
									type="category"
									width={112}
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<XAxis type="number" hide />
								<ChartTooltip content={<ChartTooltipContent hideLabel nameKey="natureId" />} />
								<Bar dataKey="count" radius={4}>
									{eventsByNature.map((item, index) => (
										<Cell key={item.natureId} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ChartContainer>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
