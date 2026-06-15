import useSWR from "swr";
import type { BackupRecord, DiskState } from "@/data/backup-service";

type SavesResponse = {
	saves: BackupRecord[];
	disk: DiskState;
};

const fetcher = (url: string): Promise<SavesResponse> =>
	fetch(url).then((r) => {
		if (!r.ok) throw new Error("Failed to fetch saves");
		return r.json();
	});

export function useSaves() {
	const { data, error, isLoading, mutate } = useSWR<SavesResponse>("/api/saves", fetcher);
	return {
		saves: data?.saves,
		disk: data?.disk,
		error,
		isLoading,
		mutate,
	};
}
