import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

const getLabels = async () => {
  return prisma.label.findMany({
    orderBy: { label: "asc" },
  });
};

const create = async (data: Prisma.LabelCreateInput) => {
  return prisma.label.create({
    data,
  });
};

const del = async (id: string) => {
  return prisma.label.delete({
    where: { id },
  });
};

const update = async (id: string, data: Prisma.LabelUpdateInput) => {
  return prisma.label.update({
    where: { id },
    data,
  });
};

export const LabelsService = {
  getLabels,
  create,
  delete: del,
  update,
};
