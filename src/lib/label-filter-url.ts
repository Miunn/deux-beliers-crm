import type { SelectedState } from "@/components/ui/multi-select";

type LabelLike = {
	id: string;
	label: string;
};

function normalizeLabelToken(value: string): string {
	return value.trim().replace(/^#/, "").toLowerCase();
}

export function parseLabelIdUrlParam(param: string | null): string[] {
	if (!param) return [];

	try {
		const parsed = JSON.parse(param);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((item) => {
				if (typeof item === "string") return item.trim();
				if (item && typeof item === "object" && typeof item.id === "string") return item.id.trim();
				return "";
			})
			.filter(Boolean);
	} catch {
		return param
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
}

export function resolveLabelTokensToSelectedStates(
	tokens: string[],
	labels: LabelLike[],
): SelectedState[] {
	const byId = new Map(labels.map((label) => [label.id, label]));
	const byName = new Map(labels.map((label) => [normalizeLabelToken(label.label), label]));

	const resolved: SelectedState[] = [];

	for (const token of tokens) {
		const directMatch = byId.get(token);
		if (directMatch) {
			resolved.push({ action: "or", id: directMatch.id });
			continue;
		}

		const nameMatch = byName.get(normalizeLabelToken(token));
		if (nameMatch) {
			resolved.push({ action: "or", id: nameMatch.id });
		}
	}

	return resolved;
}

export function buildLabelFilterUrl(labelIds: string[]): string {
	return `/new?labelId=${encodeURIComponent(JSON.stringify(labelIds))}`;
}
