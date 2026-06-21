import { createBackup } from "@/data/backup-service";
import { prisma } from "@/lib/prisma";

async function main() {
	const save = await createBackup("cron");
	console.log(`Backup created: ${save.id} (${save.filename})`);
}

main()
	.catch((error) => {
		console.error("Backup failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
