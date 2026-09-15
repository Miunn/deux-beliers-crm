export type VoucherStatus = "sent" | "booked" | "redeemed" | "expired" | "cancelled";

export type Voucher = {
	id: number;
	code: string;
	status: VoucherStatus;
	status_label: string;
	recipient_email: string;
	recipient_name: string;
	buyer_email: string;
	message: string | null;
	order_id: number;
	order_item_id: number;
	product_id: number;
	created_at: string;
	redeemed_at: string | null;
	redeemed_by: number | null;
	expires_at: string | null;
};

export type VouchersResponse = {
	items: Voucher[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
};

export type VouchersQuery = {
	status?: VoucherStatus | "";
	search?: string;
	page?: number;
	per_page?: number;
};

export type CreateVoucherInput = {
	email: string;
	name?: string;
	code?: string;
	message?: string;
	buyer_email?: string;
	product_id?: number;
	send_email?: boolean;
};

export type CreateVoucherResponse = {
	created: boolean;
	email_sent: boolean;
	message: string;
	voucher: Voucher & { product_name?: string };
};

export type VoucherProduct = {
	id: number;
	name: string;
};

export type VoucherProductsResponse = {
	items: VoucherProduct[];
};

export type UpdateVoucherInput = {
	recipient_email?: string;
	email?: string;
	recipient_name?: string;
	name?: string;
	buyer_email?: string;
	message?: string;
	product_id?: number;
	code?: string;
	status?: VoucherStatus;
	expires_at?: string | null;
	order_id?: number;
	order_item_id?: number;
};

export type GetVoucherResponse = {
	voucher: Voucher & { product_name?: string };
};

export type UpdateVoucherResponse = {
	updated: boolean;
	message: string;
	voucher: Voucher & { product_name?: string };
};

export type ResendVoucherResponse = {
	sent: boolean;
	delivery_email: string;
	message?: string;
	voucher: Voucher & { product_name?: string };
};

export type RedeemVoucherResponse = {
	found: boolean;
	valid: boolean;
	redeemed?: boolean;
	booked?: boolean;
	message: string;
	voucher?: Voucher & { product_name?: string };
};
