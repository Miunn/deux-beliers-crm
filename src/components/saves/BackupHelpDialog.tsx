"use client";

import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

type CommandLine = { text: string; prompt?: boolean; promptChar?: string };

function toDisplayLines(command?: string, lines?: CommandLine[]): CommandLine[] {
	if (lines) {
		return lines.map((line, i) => ({
			text: line.text,
			prompt: line.prompt ?? i === 0,
			promptChar: line.promptChar,
		}));
	}
	if (!command) return [];
	return command.split("\n").map((text, i) => ({
		text,
		prompt: i === 0,
	}));
}

function CommandBlock({ title, command, lines }: { title: string; command?: string; lines?: CommandLine[] }) {
	const displayLines = toDisplayLines(command, lines);

	return (
		<div>
			<p className="text-sm font-medium mb-2">{title}</p>
			<div className="rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-100 overflow-hidden">
				<div className="p-3 space-y-0.5 leading-relaxed">
					{displayLines.map((line, i) => (
						<div key={i} className="flex gap-2">
							<span className="select-none shrink-0 w-3">
								{line.prompt && line.promptChar ? (
									line.promptChar
								) : line.prompt ? (
									<span className="text-emerald-400">$</span>
								) : (
									""
								)}
							</span>
							<span className="break-all">{line.text}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function BackupHelpDialog() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="size-7 shrink-0 text-muted-foreground hover:bg-transparent"
				onClick={() => setOpen(true)}
				aria-label="Commandes de sauvegarde automatique"
			>
				<CircleHelp className="size-4" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Sauvegardes automatiques</DialogTitle>
						<DialogDescription>
							Lancer une sauvegarde sans ouvrir l&apos;application via un cron ou un appel HTTP.
							L&apos;endpoint HTTP exige la variable d&apos;environnement{" "}
							<code className="text-xs">CRON_SECRET</code>.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<CommandBlock title="Script npm" command="npm run backup" />
						<CommandBlock
							title="Exemple cron (quotidien à 2h)"
							lines={[
								{ text: "crontab -e" },
								{ text: "0 2 * * * cd /srv/crm && npm run backup", prompt: true, promptChar: ">" },
							]}
						/>
						<CommandBlock
							title="Appel HTTP"
							command={`curl -X POST https://crm.deuxbeliers.fr/api/cron/backup -H "Authorization: Bearer $CRON_SECRET"`}
						/>
						<CommandBlock
							title="Alternative HTTP (en-tête personnalisé)"
							command={`curl -X POST https://crm.deuxbeliers.fr/api/cron/backup -H "X-Cron-Secret: $CRON_SECRET"`}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
