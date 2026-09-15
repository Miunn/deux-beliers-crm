import useSWR from "swr";
import type { VoucherProductsResponse, VouchersQuery, VouchersResponse } from "@/types/voucher-types";

function buildVouchersUrl(query: VouchersQuery): string {
	const params = new URLSearchParams();
	if (query.status) params.set("status", query.status);
	if (query.search) params.set("search", query.search);
	params.set("page", String(query.page ?? 1));
	params.set("per_page", String(query.per_page ?? 20));
	return `/api/vouchers?${params.toString()}`;
}

const fetcher = async (url: string): Promise<VouchersResponse> => {
	const res = await fetch(url, { cache: "no-store" });
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error(typeof body.error === "string" ? body.error : "Impossible de récupérer les bons");
	}
	return body as VouchersResponse;
};

export function useVoucherProducts(enabled = true) {
	const { data, error, isLoading } = useSWR<VoucherProductsResponse>(
		enabled ? "/api/vouchers/products" : null,
		async (url: string) => {
			const res = await fetch(url, { cache: "no-store" });
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(typeof body.error === "string" ? body.error : "Impossible de récupérer les produits");
			}
			return body as VoucherProductsResponse;
		},
	);

	return {
		products: data?.items ?? [],
		error,
		isLoading,
	};
}

export function useVouchers(query: VouchersQuery) {
	const { data, error, isLoading, mutate } = useSWR<VouchersResponse>(buildVouchersUrl(query), fetcher);

	return {
		vouchers: data?.items,
		total: data?.total ?? 0,
		page: data?.page ?? query.page ?? 1,
		perPage: data?.per_page ?? query.per_page ?? 20,
		totalPages: data?.total_pages ?? 1,
		error,
		isLoading,
		mutate,
	};
}
