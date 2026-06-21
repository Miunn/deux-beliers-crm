export type CHANGELOG_ENTRY = {
	version: string;
	date: string;
	description: string;
	lines: { type: "added" | "changed" | "removed" | "fixed" | "security"; description: string }[];
}


export const CHANGELOG: CHANGELOG_ENTRY[] = [
	{
		version: "v1.0.0",
		date: "21/06/2026",
		description: "Cette version introduit la nouvelle interface, plus moderne, stable et performante ainsi que différente fonctionnalités.",
		lines: [
			{ type: "added", description: "Interface modernisé accessible depuis /new" },
			{ type: "added", description: "Barre de navigation remplaçant la navigation par icones dans le header" },
			{ type: "added", description: "Système de sauvegarde in-app" },
			{ type: "added", description: "Vue tableau" },
			{ type: "added", description: "Page de gestion des libellés" },
			{ type: "added", description: "Page de gestion des natures d'évènements" },
			{ type: "added", description: "Page d'importation" },
			{ type: "added", description: "Page d'exportation" },
			{ type: "added", description: "Page des changements" },
			{ type: "added", description: "Page de paramètres" },
			{ type: "added", description: "Icone de navigation entre la modification et les évènements clients au sein des dialogs" },
			{ type: "changed", description: "Style des filtres des vues cartes et kanban" }
		],
	},
];
