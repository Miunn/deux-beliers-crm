import { prisma } from "@/lib/prisma";

type CreateEventInput = {
  date: Date;
  natureId: string;
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
  return prisma.event.create({
    data: {
      date: data.date,
      commentaires: data.commentaires,
      nature: { connect: { id: data.natureId } },
      contact: { connect: { id: contactId } },
    },
    include: { nature: true },
  });
};

const update = async (id: string, data: UpdateEventInput) => {
  return prisma.event.update({
    where: { id },
    data: {
      date: data.date,
      commentaires: data.commentaires,
      nature: data.natureId ? { connect: { id: data.natureId } } : undefined,
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
