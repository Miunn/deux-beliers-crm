import { toast } from "sonner";
import { Contact } from "../../../generated/prisma";
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
import { deleteContact } from "@/actions/contacts";
import { useState } from "react";
import { useContactsContext } from "@/context/ContactsContext";

export default function DeleteContact({
  contact,
  open,
  onOpenChange,
  children,
}: {
  contact: Contact;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const { removeContact } = useContactsContext();
  const [isOpen, setIsOpen] = useState(open);
  const internalOpen = open ?? isOpen;
  const internalOnOpenChange = onOpenChange ?? setIsOpen;
  const deleteContactAction = async (id: string) => {
    deleteContact(id).then((res) => {
      if (res && "error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Contact supprimé avec succès");
        internalOnOpenChange(false);
        removeContact(id);
      }
    });
  };
  return (
    <Dialog open={internalOpen} onOpenChange={internalOnOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le contact</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le contact {contact.nom} ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => deleteContactAction(contact.id)}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
