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
    await EventsService.create(contactId, {
      date: parsed.data.date,
      natureId: parsed.data.natureId,
      attendus: parsed.data.attendus,
      date_traitement: parsed.data.date_traitement,
      resultat: parsed.data.resultat,
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la création de l'événement" } as const;
  }
}

export async function createEventWithReminder(
  contactId: string,
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>,
  reminderDate: Date
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
          date: parsed.data.date,
          attendus: parsed.data.attendus,
          date_traitement: parsed.data.date_traitement,
          resultat: parsed.data.resultat,
          nature: { connect: { id: parsed.data.natureId } },
          contact: { connect: { id: contactId } },
        },
      });
      // Find or create a Nature with label "Rappel"
      const rappelNature = await tx.nature.upsert({
        where: { label: "Rappel" },
        update: {},
        create: { label: "Rappel" },
      });
      await tx.event.create({
        data: {
          date: reminderDate,
          attendus: `Rappel programmé`,
          resultat: "",
          nature: { connect: { id: rappelNature.id } },
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
  data: z.infer<typeof CREATE_EVENT_FORM_SCHEMA>,
  reminderDate: Date
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
        data: {
          date: parsed.data.date,
          attendus: parsed.data.attendus,
          date_traitement: parsed.data.date_traitement,
          resultat: parsed.data.resultat,
          nature: { connect: { id: parsed.data.natureId } },
        },
      });
      const rappelNature = await tx.nature.upsert({
        where: { label: "Rappel" },
        update: {},
        create: { label: "Rappel" },
      });
      await tx.event.create({
        data: {
          date: reminderDate,
          attendus: `Rappel programmé`,
          resultat: "",
          nature: { connect: { id: rappelNature.id } },
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
    await EventsService.update(id, {
      date: parsed.data.date,
      natureId: parsed.data.natureId,
      attendus: parsed.data.attendus,
      date_traitement: parsed.data.date_traitement,
      resultat: parsed.data.resultat,
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour de l'événement" } as const;
  }
}
