"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CREATE_ACTIVITE_FORM_SCHEMA } from "@/lib/definitions";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { createActivite } from "@/actions/activites";
import { useSWRConfig } from "swr";

export default function CreateActivite({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { mutate } = useSWRConfig();
  const [isOpen, setIsOpen] = useState(open);
  const internalOpen = open ?? isOpen;
  const internalOnOpenChange = onOpenChange ?? setIsOpen;

  const form = useForm<z.infer<typeof CREATE_ACTIVITE_FORM_SCHEMA>>({
    resolver: zodResolver(CREATE_ACTIVITE_FORM_SCHEMA),
    defaultValues: {
      label: "",
    },
  });

  const onSubmit = (data: z.infer<typeof CREATE_ACTIVITE_FORM_SCHEMA>) => {
    createActivite(data).then((res) => {
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Activité enregistrée avec succès");
        internalOnOpenChange(false);
        mutate("/api/activites");
        form.reset();
      }
    });
  };

  return (
    <Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une activité</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Libellé</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
