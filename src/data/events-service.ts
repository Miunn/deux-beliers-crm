import { prisma } from "@/lib/prisma";

type CreateEventInput = {
	date: Date;
	natureId?: string;
	commentaires?: string;
};

type UpdateEventInput = Partial<CreateEventInput>;

const getByContact = async (contactId: string) => {
	return prisma.event.findMany({
		where: { contactId },
		orderBy: { date: "desc" },
		include: { nature: true },
	});
};

const getByDateRange = async (from: Date, to: Date) => {
	return prisma.event.findMany({
		where: {
			date: { gte: from, lte: to },
		},
		orderBy: { date: "asc" },
		include: { nature: true, contact: true },
	});
};

const create = async (contactId: string, data: CreateEventInput) => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const event = await prisma.event.create({
		data: {
			date: data.date,
			commentaires: data.commentaires,
			nature: data.natureId ? { connect: { id: data.natureId } } : undefined,
			contact: { connect: { id: contactId }, },
		},
		include: { nature: true },
	});

	const currentRappel = await prisma.contact.findUnique({
		where: { id: contactId },
		select: { rappel: true },
	});

	if (!currentRappel?.rappel || currentRappel.rappel.getTime() < tomorrow.getTime()) {
		await prisma.contact.update({
			where: { id: contactId },
			data: { rappel: tomorrow },
		});
	}

	return event;
};

const update = async (id: string, data: UpdateEventInput) => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return prisma.event.update({
		where: { id },
		data: {
			date: data.date,
			commentaires: data.commentaires,
			nature: data.natureId ? { connect: { id: data.natureId } } : undefined,
			contact: { update: { rappel: tomorrow } },
		},
		include: { nature: true },
	});
};

const del = async (id: string) => {
	return prisma.event.delete({ where: { id } });
};

export const EventsService = {
	getByContact,
	getByDateRange,
	create,
	delete: del,
	update,
};
