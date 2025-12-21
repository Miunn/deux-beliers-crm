import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const get = async () => {
  return prisma.kanbanColumn.findMany();
};

const create = async (data: Prisma.KanbanColumnCreateInput) => {
  return prisma.kanbanColumn.create({ data });
};

const update = async (data: Prisma.KanbanColumnUpdateArgs) => {
  return prisma.kanbanColumn.update(data);
};

const del = async (id: string) => {
  return prisma.kanbanColumn.delete({ where: { id } });
};

export const KanbanService = {
  get,
  create,
  update,
  delete: del,
};
