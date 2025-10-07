import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const getContactsCount = async () => {
  return prisma.contact.count();
};

const getContacts = async (
  q?: string,
  labelId?: string,
  from?: string,
  to?: string
) => {
  const query = q?.trim();
  const textWhere: Prisma.ContactWhereInput | undefined = query
    ? {
        OR: [
          { nom: { contains: query } },
          { ville: { contains: query } },
          { contact: { contains: query } },
          { telephone: { contains: query } },
          { mail: { contains: query } },
          { observations: { contains: query } },
          { adresse: { contains: query } },
          { horaires: { contains: query } },
          { activite: { is: { label: { contains: query } } } },
          { labels: { some: { label: { contains: query } } } },
          {
            events: {
              some: {
                OR: [
                  { nature: { label: { contains: query } } },
                  { attendus: { contains: query } },
                  { resultat: { contains: query } },
                ],
              },
            },
          },
        ],
      }
    : undefined;

  let eventsDateFilter: Prisma.EventWhereInput | undefined = undefined;
  if (from || to) {
    const gte = from ? new Date(from) : undefined;
    const lte = to ? new Date(to) : undefined;
    eventsDateFilter = { date: { gte, lte } };
  }

  const and: Prisma.ContactWhereInput[] = [];
  if (textWhere) and.push(textWhere);
  if (labelId && labelId !== "all")
    and.push({ labels: { some: { id: labelId } } });
  if (eventsDateFilter) and.push({ events: { some: eventsDateFilter } });

  const where: Prisma.ContactWhereInput | undefined = and.length
    ? { AND: and }
    : undefined;

  return prisma.contact.findMany({
    where,
    include: {
      activite: true,
      events: true,
      labels: true,
    },
    orderBy: { nom: "asc" },
  });
};

const create = async (data: Prisma.ContactCreateInput) => {
  return prisma.contact.create({
    data,
  });
};

const update = async (id: string, data: Prisma.ContactUpdateInput) => {
  return prisma.contact.update({
    where: { id },
    data,
  });
};

const del = async (id: string) => {
  return prisma.contact.delete({
    where: { id },
  });
};

export const ContactService = {
  getContactsCount,
  getContacts,
  create,
  update,
  delete: del,
};
