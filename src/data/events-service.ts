import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const getByContact = async (contactId: string) => {
  return prisma.event.findMany({
    where: { contactId },
    orderBy: { date: "desc" },
  });
};

const create = async (
  contactId: string,
  data: Omit<Prisma.EventCreateInput, "contact">
) => {
  return prisma.event.create({
    data: {
      ...data,
      contact: { connect: { id: contactId } },
    },
  });
};

const update = async (id: string, data: Prisma.EventUpdateInput) => {
  return prisma.event.update({ where: { id }, data });
};

const del = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};

export const EventsService = { getByContact, create, delete: del, update };
