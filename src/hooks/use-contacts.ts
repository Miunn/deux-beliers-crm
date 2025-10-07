import useSWR from "swr";
import { Activite, Contact, Label } from "../../generated/prisma";
import { useSearchParams } from "next/navigation";

const fetcher = (
  url: string
): Promise<(Contact & { labels: Label[]; activite: Activite | null })[]> =>
  fetch(url).then((res) => res.json());

export const useContacts = (
  defaultContacts: (Contact & { labels: Label[]; activite: Activite | null })[]
) => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const labelId = searchParams.get("labelId") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (labelId) params.set("labelId", labelId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const key = params.toString()
    ? `/api/contacts?${params.toString()}`
    : "/api/contacts";

  const { data, error, isLoading } = useSWR<
    (Contact & { labels: Label[]; activite: Activite | null })[]
  >(key, fetcher, {
    fallbackData: defaultContacts,
  });
  return { data, error, isLoading };
};
