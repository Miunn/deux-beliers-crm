"use server";

import { LabelsService } from "@/data/labels-service";
import { CREATE_LABEL_FORM_SCHEMA } from "@/lib/definitions";
import z from "zod";
import { AuthLayer } from "@/data/auth-layer";

export async function createLabel(
  data: z.infer<typeof CREATE_LABEL_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const validated = CREATE_LABEL_FORM_SCHEMA.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.message } as const;
  }

  try {
    await LabelsService.create(validated.data);
  } catch (e) {
    if (
      e instanceof Error &&
      "code" in e &&
      e.constructor.name === "PrismaClientKnownRequestError"
    ) {
      if (e.code === "P2002") {
        return { error: "Ce libellé existe déjà" } as const;
      }
    }
    return { error: "Erreur lors de la création du libellé" } as const;
  }

  return { success: true } as const;
}

export async function deleteLabel(id: string) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  try {
    await LabelsService.delete(id);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la suppression du libellé" } as const;
  }
}

export async function updateLabel(
  id: string,
  data: z.infer<typeof CREATE_LABEL_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const validated = CREATE_LABEL_FORM_SCHEMA.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.message } as const;
  }

  try {
    await LabelsService.update(id, validated.data);
  } catch (e) {
    if (
      e instanceof Error &&
      "code" in e &&
      e.constructor.name === "PrismaClientKnownRequestError"
    ) {
      if (e.code === "P2002") {
        return { error: "Ce libellé existe déjà" } as const;
      }
    }
    return { error: "Erreur lors de la mise à jour du libellé" } as const;
  }

  return { success: true } as const;
}
