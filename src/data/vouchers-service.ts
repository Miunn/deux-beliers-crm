import type {
	CreateVoucherInput,
	CreateVoucherResponse,
	GetVoucherResponse,
	RedeemVoucherResponse,
	ResendVoucherResponse,
	UpdateVoucherInput,
	UpdateVoucherResponse,
	VoucherProduct,
	VoucherProductsResponse,
	VouchersQuery,
	VouchersResponse,
} from "@/types/voucher-types";

const DEFAULT_VOUCHERS_API_NAMESPACE = "https://deuxbeliers.fr/wp-json/db-vouchers/v1";

export class VoucherActionError extends Error {
	constructor(
		public status: number,
		message: string,
		public data?: RedeemVoucherResponse,
	) {
		super(message);
		this.name = "VoucherActionError";
	}
}

function getVouchersApiNamespace(): string {
	const configured = process.env.WP_VOUCHERS_API_URL;
	if (!configured) return DEFAULT_VOUCHERS_API_NAMESPACE;
	return configured.replace(/\/$/, "").replace(/\/vouchers$/, "");
}

function getVouchersApiUrl(): string {
	return `${getVouchersApiNamespace()}/vouchers`;
}

function getVouchersValidateApiUrl(): string {
	return `${getVouchersApiUrl()}/validate`;
}

function getVoucherProductsApiUrl(): string {
	return `${getVouchersApiNamespace()}/products`;
}

function getVoucherByIdApiUrl(id: number): string {
	return `${getVouchersApiUrl()}/${id}`;
}

function getBasicAuthHeader(): string {
	const user = process.env.WP_VOUCHERS_USER;
	const password = process.env.WP_VOUCHERS_APP_PASSWORD;
	if (!user || !password) {
		throw new Error("WP_VOUCHERS_USER et WP_VOUCHERS_APP_PASSWORD doivent être configurés");
	}
	return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

function getAuthHeaders(): Record<string, string> {
	return {
		Authorization: getBasicAuthHeader(),
		Accept: "application/json",
	};
}

async function parseWordPressError(res: Response): Promise<string> {
	let message = `Erreur ${res.status}`;
	try {
		const body = (await res.json()) as { message?: string };
		message = body.message ?? message;
	} catch {
		// ignore parse errors
	}
	return message;
}

export async function fetchVouchers(query: VouchersQuery = {}): Promise<VouchersResponse> {
	const url = new URL(getVouchersApiUrl());

	if (query.status) url.searchParams.set("status", query.status);
	if (query.search) url.searchParams.set("search", query.search);
	url.searchParams.set("page", String(Math.max(1, query.page ?? 1)));
	url.searchParams.set("per_page", String(Math.min(100, Math.max(1, query.per_page ?? 20))));

	const res = await fetch(url.toString(), {
		headers: getAuthHeaders(),
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseWordPressError(res));
	}

	return res.json() as Promise<VouchersResponse>;
}

function parseVoucherProducts(body: unknown): VoucherProduct[] {
	const items = body && typeof body === "object" && "items" in body ? (body as { items: unknown }).items : null;
	if (!Array.isArray(items)) {
		throw new Error("Réponse produits invalide");
	}

	return items.flatMap((item) => {
		if (!item || typeof item !== "object") return [];
		const { id, name } = item as { id?: unknown; name?: unknown };
		if (typeof id !== "number" || !Number.isInteger(id) || id <= 0 || typeof name !== "string" || name === "") {
			return [];
		}
		return [{ id, name }];
	});
}

export async function fetchVoucherProducts(): Promise<VoucherProductsResponse> {
	const res = await fetch(getVoucherProductsApiUrl(), {
		headers: getAuthHeaders(),
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseWordPressError(res));
	}

	return { items: parseVoucherProducts(await res.json()) };
}

export async function fetchVoucher(id: number): Promise<GetVoucherResponse> {
	const res = await fetch(getVoucherByIdApiUrl(id), {
		headers: getAuthHeaders(),
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseWordPressError(res));
	}

	return res.json() as Promise<GetVoucherResponse>;
}

export async function updateVoucher(id: number, input: UpdateVoucherInput): Promise<UpdateVoucherResponse> {
	const res = await fetch(getVoucherByIdApiUrl(id), {
		method: "PATCH",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
		cache: "no-store",
	});

	const body = (await res.json()) as UpdateVoucherResponse & { message?: string };

	if (res.ok && body.updated) {
		return body;
	}

	throw new Error(body.message ?? `Erreur ${res.status}`);
}

export async function createVoucher(
	input: CreateVoucherInput,
): Promise<{ status: 201 | 202; data: CreateVoucherResponse }> {
	const res = await fetch(getVouchersApiUrl(), {
		method: "POST",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: input.email,
			name: input.name ?? "",
			code: input.code ?? "",
			message: input.message ?? "",
			...(input.buyer_email?.trim() ? { buyer_email: input.buyer_email.trim() } : {}),
			product_id: input.product_id ?? 0,
			send_email: input.send_email ?? false,
		}),
		cache: "no-store",
	});

	const body = (await res.json()) as CreateVoucherResponse & { message?: string };

	if (res.status === 201 || res.status === 202) {
		return { status: res.status, data: body as CreateVoucherResponse };
	}

	throw new Error(body.message ?? `Erreur ${res.status}`);
}

export async function redeemVoucher(code: string): Promise<RedeemVoucherResponse> {
	const res = await fetch(getVouchersValidateApiUrl(), {
		method: "POST",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code, redeem: true }),
		cache: "no-store",
	});

	const body = (await res.json()) as RedeemVoucherResponse;

	if (res.status === 200 && body.redeemed) {
		return body;
	}

	throw new VoucherActionError(res.status, body.message ?? `Erreur ${res.status}`, body);
}

export async function bookVoucher(code: string): Promise<RedeemVoucherResponse> {
	const res = await fetch(getVouchersValidateApiUrl(), {
		method: "POST",
		headers: {
			...getAuthHeaders(),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code, book: true }),
		cache: "no-store",
	});

	const body = (await res.json()) as RedeemVoucherResponse;

	if (res.status === 200 && body.booked) {
		return body;
	}

	throw new VoucherActionError(res.status, body.message ?? `Erreur ${res.status}`, body);
}

export async function resendVoucher(id: number): Promise<ResendVoucherResponse> {
	const res = await fetch(`${getVoucherByIdApiUrl(id)}/resend`, {
		method: "POST",
		headers: getAuthHeaders(),
		cache: "no-store",
	});

	const body = (await res.json()) as ResendVoucherResponse & { message?: string };

	if (res.status === 200 && body.sent) {
		return body;
	}

	throw new VoucherActionError(res.status, body.message ?? `Erreur ${res.status}`);
}
