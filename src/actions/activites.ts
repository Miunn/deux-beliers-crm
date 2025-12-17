"use server";

import { ActivitesService } from "@/data/activites-service";
import { CREATE_ACTIVITE_FORM_SCHEMA } from "@/lib/definitions";
import z from "zod";
import { AuthLayer } from "@/data/auth-layer";

export async function createActivite(
  data: z.infer<typeof CREATE_ACTIVITE_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const validatedData = CREATE_ACTIVITE_FORM_SCHEMA.safeParse(data);

  if (!validatedData.success) {
    return { error: validatedData.error.message };
  }

  try {
    await ActivitesService.create(validatedData.data);
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      "code" in e &&
      e.constructor.name === "PrismaClientKnownRequestError"
    ) {
      if (e.code === "P2002") {
        return { error: "Cette activité existe déjà" };
      }
    }
    return { error: "Erreur lors de la création de l'activité" };
  }

  return { success: true };
}
