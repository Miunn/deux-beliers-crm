"use server";

import { EventsService } from "@/data/events-service";
import { CREATE_EVENT_FORM_SCHEMA } from "@/lib/definitions";
import { auth } from "@/lib/auth";
import z from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function createEvent(
  contactId: string,
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>
) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  const parsed = CREATE_EVENT_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await EventsService.create(contactId, parsed.data);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la création de l'événement" } as const;
  }
}

export async function createEventWithReminder(
  contactId: string,
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>
) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  const parsed = CREATE_EVENT_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.event.create({
        data: {
          ...parsed.data,
          contact: { connect: { id: contactId } },
        },
      });
      const baseDate = new Date(parsed.data.date);
      const reminderDate = new Date(baseDate);
      reminderDate.setMonth(reminderDate.getMonth() + 1);
      await tx.event.create({
        data: {
          date: reminderDate,
          nature: "Rappel",
          attendus: parsed.data.nature
            ? `Rappel de: ${parsed.data.nature}`
            : undefined,
          resultat: "",
          contact: { connect: { id: contactId } },
        },
      });
    });
    return { success: true } as const;
  } catch {
    return {
      error: "Erreur lors de la création de l'événement avec rappel",
    } as const;
  }
}

export async function updateEventWithReminder(
  id: string,
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>
) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  const parsed = CREATE_EVENT_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id },
        data: parsed.data,
      });
      const baseDate = new Date(parsed.data.date);
      const reminderDate = new Date(baseDate);
      reminderDate.setMonth(reminderDate.getMonth() + 1);
      await tx.event.create({
        data: {
          date: reminderDate,
          nature: "Rappel",
          attendus: parsed.data.nature
            ? `Rappel de: ${parsed.data.nature}`
            : undefined,
          resultat: "",
          contact: { connect: { id: updated.contactId } },
        },
      });
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour avec rappel" } as const;
  }
}

export async function deleteEvent(id: string) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  try {
    await EventsService.delete(id);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la suppression de l'événement" } as const;
  }
}

export async function updateEvent(
  id: string,
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>
) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });
  if (!session) return { error: "Unauthorized" } as const;
  const parsed = CREATE_EVENT_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await EventsService.update(id, parsed.data);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour de l'événement" } as const;
  }
}
