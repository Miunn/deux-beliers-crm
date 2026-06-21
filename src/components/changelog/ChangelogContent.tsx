import { CHANGELOG, CHANGELOG_ENTRY } from "@/lib/changelog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const CHANGE_TYPE_CONFIG: Record<
	CHANGELOG_ENTRY["lines"][number]["type"],
	{ label: string; badgeClassName: string }
> = {
	added: {
		label: "Ajout",
		badgeClassName:
			"border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
	},
	changed: {
		label: "Modification",
		badgeClassName:
			"border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
	},
	removed: {
		label: "Suppression",
		badgeClassName:
			"border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
	},
	fixed: {
		label: "Correction",
		badgeClassName:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
	},
	security: {
		label: "Sécurité",
		badgeClassName:
			"border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
	},
};

function ChangelogEntry({ entry, isLatest }: { entry: CHANGELOG_ENTRY; isLatest: boolean }) {
	return (
		<article className="space-y-3 border-b pb-8 last:border-b-0 last:pb-0">
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<h3 className="font-mono text-sm font-semibold">{entry.version}</h3>
				<time className="text-sm text-muted-foreground">{entry.date}</time>
				{isLatest ? (
					<Badge variant="secondary" className="text-[11px]">
						Dernière version
					</Badge>
				) : null}
			</div>
			<p className="text-sm font-medium">{entry.description}</p>
			<ul className="space-y-1.5 text-sm">
				{entry.lines.map((line, lineIndex) => {
					const config = CHANGE_TYPE_CONFIG[line.type];

					return (
						<li key={`${entry.version}-${lineIndex}`} className="flex items-start gap-2 leading-relaxed">
							<Badge
								variant="outline"
								className={cn("mt-0.5 shrink-0 text-[11px]", config.badgeClassName)}
							>
								{config.label}
							</Badge>
							<span className="text-foreground/90">{line.description}</span>
						</li>
					);
				})}
			</ul>
		</article>
	);
}

export default function ChangelogContent() {
	if (CHANGELOG.length === 0) {
		return <p className="text-sm text-muted-foreground">Aucune entrée dans le changelog pour le moment.</p>;
	}

	return (
		<div className="space-y-8">
			{CHANGELOG.map((entry, index) => (
				<ChangelogEntry key={entry.version} entry={entry} isLatest={index === 0} />
			))}
		</div>
	);
}
