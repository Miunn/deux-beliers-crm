import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const getNatures = async () => {
  return prisma.nature.findMany({ orderBy: { label: "asc" } });
};

const create = async (data: Prisma.NatureCreateInput) => {
  return prisma.nature.create({ data });
};

const update = async (id: string, data: Prisma.NatureUpdateInput) => {
  return prisma.nature.update({
    where: { id },
    data,
  });
};

const del = async (id: string) => {
  return prisma.nature.delete({ where: { id } });
};

export const NaturesService = { getNatures, create, update, delete: del };
