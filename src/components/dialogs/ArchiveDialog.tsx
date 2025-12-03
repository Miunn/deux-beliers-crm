import { updateContact } from "@/actions/contacts";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import React from "react";
import {
  ContactWithRelations,
  useContactsContext,
} from "@/context/ContactsContext";
import { Loader2 } from "lucide-react";

export default function ArchiveDialog({
  contact,
  children,
}: {
  contact: ContactWithRelations;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { removeContact } = useContactsContext();

  const handleArchive = async () => {
    setLoading(true);
    const r = await updateContact(contact.id, {
      nom: contact.nom,
      mail: contact.mail || "",
      active: false,
    });

    if ("error" in r) {
      setLoading(false);
      toast.error("Erreur lors de l'archivage du contact");
      return;
    }

    removeContact(contact.id);
    toast.success("Contact archivé avec succès");
    setOpen(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archiver le contact {contact.nom} ?</DialogTitle>
          <DialogDescription>
            Le contact sera archivé et ne sera plus visible dans la liste
            principale. Il restera accessible depuis l&apos;onglet des contacts
            archivés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Annuler</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={handleArchive}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archivage...
              </>
            ) : (
              "Archiver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
