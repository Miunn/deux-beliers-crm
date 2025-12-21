"use server";

import { AuthLayer } from "@/data/auth-layer";
import { KanbanService } from "@/data/kanban-service";
import { CREATE_KANBAN_COLUMN_FORM_SCHEMA } from "@/lib/definitions";
import { ContactService } from "@/data/contact-service";
import z from "zod";

/**
 * Column CRUD (existing behaviour kept)
 */
export async function createKanbanColumn(
  data: z.infer<typeof CREATE_KANBAN_COLUMN_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const parsed = CREATE_KANBAN_COLUMN_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await KanbanService.create({
      name: parsed.data.name,
      color: parsed.data.color,
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la création de la colonne" } as const;
  }
}

export async function updateKanbanColumn(
  id: string,
  data: z.infer<typeof CREATE_KANBAN_COLUMN_FORM_SCHEMA>,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  const parsed = CREATE_KANBAN_COLUMN_FORM_SCHEMA.safeParse(data);
  if (!parsed.success) return { error: parsed.error.message } as const;

  try {
    await KanbanService.update({
      where: { id },
      data: { name: parsed.data.name, color: parsed.data.color },
    });
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour de la colonne" } as const;
  }
}

export async function deleteKanbanColumn(id: string) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  try {
    await KanbanService.delete(id);
    return { success: true } as const;
  } catch {
    return { error: "Erreur lors de la mise à jour de la colonne" } as const;
  }
}

/**
 * New actions to support moving a card and reindexing a column.
 *
 * Strategy:
 * - `moveKanbanCard` performs a simple update of a contact's column and numeric position.
 *   This is used when the client computes a safe numeric `kanbanPosition` (e.g. median between neighbours).
 * - `reindexColumnAndMoveCard` is used when there is insufficient space between neighbouring positions.
 *   It rebuilds positions for the whole column using fixed gaps, inserts the moved card at `targetIndex`,
 *   and applies all updates inside a transaction to avoid inconsistent state.
 *
 * Note: these actions operate on the `contact` rows (cards) because cards in this app are contacts.
 */

export async function moveKanbanCard(
  id: string,
  kanbanColumnId: string | null,
) {
  const isAuth = await AuthLayer.isAuthenticated();

  if (!isAuth) {
    return { error: "Unauthorized" } as const;
  }

  try {
    // Use the ContactService layer to update the contact's column and position.
    await ContactService.update(id, {
      kanbanColumn: kanbanColumnId
        ? { connect: { id: kanbanColumnId } }
        : { disconnect: true },
    });

    return { success: true } as const;
  } catch (err) {
    console.error("moveKanbanCard error:", err);
    return { error: "Erreur lors du déplacement de la carte" } as const;
  }
}
