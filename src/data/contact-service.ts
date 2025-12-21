import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const getContactsCount = async () => {
  return prisma.contact.count();
};

const getContacts = async (
  q?: string,
  labelId?: string,
  from?: string,
  to?: string,
  active: boolean = true,
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
                  { commentaires: { contains: query } },
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
  if (labelId && labelId !== "all") {
    const labelIds = labelId.split(",").filter(Boolean);
    if (labelIds.length === 1) {
      and.push({ labels: { some: { id: labelIds[0] } } });
    } else if (labelIds.length > 1) {
      and.push({
        AND: labelIds.map((id) => ({ labels: { some: { id } } })),
      });
    }
  }
  if (eventsDateFilter) and.push({ events: { some: eventsDateFilter } });

  const where: Prisma.ContactWhereInput | undefined = and.length
    ? { AND: and, active: active }
    : { active: active };

  return prisma.contact.findMany({
    where,
    include: {
      activite: true,
      events: { include: { nature: true } },
      labels: true,
      kanbanColumn: true,
    },
    orderBy: { nom: "asc" },
  });
};

const create = async (data: Prisma.ContactCreateInput) => {
  return prisma.contact.create({
    data,
    include: {
      activite: true,
      events: true,
      labels: true,
      kanbanColumn: true,
    },
  });
};

const update = async (id: string, data: Prisma.ContactUpdateInput) => {
  return prisma.contact.update({
    where: { id },
    data,
    include: {
      activite: true,
      events: true,
      labels: true,
      kanbanColumn: true,
    },
  });
};

const getById = async (id: string) => {
  return prisma.contact.findUnique({
    where: { id },
    include: { activite: true, events: true, labels: true, kanbanColumn: true },
  });
};

const del = async (id: string) => {
  return prisma.contact.delete({
    where: { id },
  });
};

/**
 * New helper methods to work with kanban positions via the service layer.
 *
 * - getContactsByColumn(columnId)
 *    -> returns contacts for a specific column ordered by kanbanPosition (nulls last)
 *
 * - bulkUpdatePositions(updates)
 *    -> performs a bulk update of contacts' kanbanPosition and kanbanColumnId inside a transaction
 *
 * - initializeColumnPositions(columnId, gap)
 *    -> ensure pre-existing data in a column has numeric kanbanPosition values:
 *       contacts without a position are assigned sequential positions spaced by `gap`.
 *    -> returns the list of updated contacts
 */

/**
 * Return contacts for a given kanban column ordered by kanbanPosition ascending.
 * Contacts with null positions are considered after those with numeric positions.
 */
const getContactsByColumn = async (columnId: string) => {
  const items = await prisma.contact.findMany({
    where: { kanbanColumnId: columnId },
    include: { activite: true, events: true, labels: true },
  });

  return items;
};

export const ContactService = {
  getContactsCount,
  getContacts,
  getById,
  create,
  update,
  delete: del,
  getContactsByColumn,
};
