"use client";

import { useLabels } from "@/hooks/use-labels";
import { MultiSelect, SelectedState } from "../ui/multi-select";

type Props = {
	value: SelectedState[];
	onChange: (value: SelectedState[]) => void;
};

export default function LabelsFilter({ value, onChange }: Props) {
	const { data: labels } = useLabels();

	return (
		<MultiSelect
			maxCount={2}
			autoSize
			options={
				labels?.map((label) => ({
					label: label.label,
					value: label.id,
					icon: () => (
						<div
							key={label.id}
							className="size-4 rounded-md"
							style={{ backgroundColor: label.color }}
						/>
					),
				})) ?? []
			}
			placeholder="Libellés"
			onValueChange={onChange}
			defaultValue={value}
		/>
	);
}
