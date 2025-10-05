import { CREATE_ACTIVITE_FORM_SCHEMA } from "@/lib/definitions";
import { prisma } from "@/lib/prisma";
import z from "zod";

const getActivites = async () => {
  return prisma.activite.findMany();
};

const create = (data: z.infer<typeof CREATE_ACTIVITE_FORM_SCHEMA>) => {
  return prisma.activite.create({
    data,
  });
};

export const ActivitesService = {
  getActivites,
  create,
};
