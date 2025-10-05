"use server";

import { NaturesService } from "@/data/natures-service";
import { CREATE_NATURE_FORM_SCHEMA } from "@/lib/definitions";
import { auth } from "@/lib/auth";
import z from "zod";
import { headers } from "next/headers";

export async function createNature(
  data: z.infer<typeof CREATE_NATURE_FORM_SCHEMA>
) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  const parsed = CREATE_NATURE_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await NaturesService.create(parsed.data);
    return { success: true } as const;
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      "code" in e &&
      e.constructor.name === "PrismaClientKnownRequestError"
    ) {
      if (e.code === "P2002") {
        return { error: "Cette nature existe déjà" } as const;
      }
    }
    return { error: "Erreur lors de la création de la nature" } as const;
  }
}

export async function deleteNature(id: string) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  try {
    await NaturesService.delete(id);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la suppression de la nature" } as const;
  }
}
