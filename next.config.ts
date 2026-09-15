import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	cacheComponents: true,
	serverExternalPackages: [
		"@prisma/client",
		"@prisma/adapter-mariadb",
		"mariadb",
	],
};

export default nextConfig;
