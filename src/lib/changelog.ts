export type CHANGELOG_ENTRY = {
	version: string;
	date: string;
	description: string;
	lines: { type: "added" | "changed" | "removed" | "fixed" | "security"; description: string }[];
}


export const CHANGELOG: CHANGELOG_ENTRY[] = [
	{
		version: "v1.1.0",
		date: "01/07/2026",
		description: "Liaison des rappels aux nouveaux évènements, ajustement de la date de rappel par défaut",
		lines: [
			{ type: "changed", description: "Affichage en rouge des rappels expirés uniquement (au lieu de ceux dans moins de 7 jours)" },
			{ type: "changed", description: "Enregistrer avec rappel propose désormais une date à 45 jours par défaut" },
			{ type: "added", description: "Création ou mise à jour du rappel associé au contact lors de l'ajout d'un évènement" },
			{ type: "added", description: "Bannière d'annonce nouvelle interface" },
		],
	},
	{
		version: "v1.0.0",
		date: "21/06/2026",
		description: "Cette version introduit la nouvelle interface, plus moderne, stable et performante ainsi que différentes fonctionnalités.",
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
