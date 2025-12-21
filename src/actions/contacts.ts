"use server";

import z from "zod";
import { ContactService } from "@/data/contact-service";
import { NEW_CONTACT_FORM_SCHEMA } from "@/lib/definitions";
import { AuthLayer } from "@/data/auth-layer";

export async function createContact(
  data: z.infer<typeof NEW_CONTACT_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const validatedData = NEW_CONTACT_FORM_SCHEMA.safeParse(data);

  if (!validatedData.success) {
    return { error: validatedData.error.message };
  }

  const { activite, ...rest } = validatedData.data;

  const contact = await ContactService.create({
    ...rest,
    activite: activite ? { connect: { id: activite } } : undefined,
  });

  return contact;
}

export async function updateContact(
  id: string,
  data: z.infer<typeof NEW_CONTACT_FORM_SCHEMA>,
) {
  console.log("SERVER Update data");
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const validatedData = NEW_CONTACT_FORM_SCHEMA.safeParse(data);

  if (!validatedData.success) {
    return { error: validatedData.error.message };
  }

  const { activite, kanbanColumnId, ...rest } = validatedData.data;

  try {
    const contact = await ContactService.update(id, {
      ...rest,
      kanbanColumn: kanbanColumnId
        ? { connect: { id: kanbanColumnId } }
        : undefined,
      activite: activite ? { connect: { id: activite } } : { disconnect: true },
    });
    return contact;
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de la mise à jour du contact" };
  }
}

export async function deleteContact(id: string) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  try {
    await ContactService.delete(id);
    return { success: true };
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      e.constructor.name === "PrismaClientKnownRequestError"
    ) {
      return { error: "Erreur lors de la suppression du contact" };
    }
    return { error: "Erreur lors de la suppression du contact" };
  }
}

export async function updateContactLabels(id: string, labelIds: string[]) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const arr = z.array(z.string());
  const parsed = arr.safeParse(labelIds);
  if (!parsed.success) {
    return { error: parsed.error.message } as const;
  }

  try {
    await ContactService.update(id, {
      labels: {
        set: parsed.data.map((labelId) => ({ id: labelId })),
      },
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour des libellés" } as const;
  }
}

export async function setReminder(id: string, reminder: Date) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  try {
    await ContactService.update(id, {
      rappel: reminder,
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour du rappel" } as const;
  }
}
