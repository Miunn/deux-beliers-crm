import { z } from "zod";

export const NEW_CONTACT_FORM_SCHEMA = z
  .object({
    nom: z.string().min(1, { message: "Le nom est requis" }),
    activite: z.string().optional(),
    ville: z.string().optional(),
    contact: z.string().optional(),
    telephone: z.string().optional(),
    mail: z.union([
      z.email({ message: "Adresse mail invalide" }),
      z.literal(""),
    ]),
    observations: z.string().optional(),
    adresse: z.string().optional(),
    horaires: z.string().optional(),
  })
  .strict();

export const CREATE_ACTIVITE_FORM_SCHEMA = z
  .object({
    label: z.string().min(1, { message: "Le libellé est requis" }),
  })
  .strict();

export const CREATE_LABEL_FORM_SCHEMA = z
  .object({
    label: z.string().min(1, { message: "Le libellé est requis" }),
    color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/i, {
      message: "Couleur hex invalide",
    }),
  })
  .strict();

export const CREATE_NATURE_FORM_SCHEMA = z
  .object({
    label: z.string().min(1, { message: "Le libellé est requis" }),
  })
  .strict();

export const CREATE_EVENT_FORM_SCHEMA = z
  .object({
    date: z.date(),
    natureId: z.string().min(1, { message: "La nature est requise" }),
    attendus: z.string().optional(),
    date_traitement: z.date().optional(),
    resultat: z.string().optional(),
  })
  .strict();

export const ACCOUNT_FORM_SCHEMA = z
  .object({
    currentPassword: z.string().optional(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.passwordConfirmation) {
        return data.password === data.passwordConfirmation;
      }
      return true;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["passwordConfirmation"],
    }
  );
