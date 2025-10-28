"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import ManageLabelsSheet from "../sheet/ManageLabels";
import ManageNaturesSheet from "../sheet/ManageNatures";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import AccountDialog from "../common/AccountDialog";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [naturesOpen, setNaturesOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const fileInputId = "__import_contacts_file_input";
  const router = useRouter();
  const [importError, setImportError] = useState<string | null>(null);
  const [importDetails, setImportDetails] = useState<string[]>([]);

  return (
    <header className="bg-background p-4 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/cropped-icon-gold.svg"
            alt="Deux Béliers"
            width={30}
            height={30}
          />
          <h1 className="text-xl text-primary font-medium">{title}</h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <nav className="whitespace-nowrap flex items-center gap-3">
            {/* <Button variant={"link"} className="cursor-pointer text-white">
              Paramètres
            </Button> */}
            <Button
              onClick={() => setLabelsOpen(true)}
              variant={"link"}
              className="cursor-pointer"
            >
              Libellés
            </Button>
            <Button
              onClick={() => setNaturesOpen(true)}
              variant={"link"}
              className="cursor-pointer"
            >
              Nature d&apos;événement
            </Button>
            <Button variant={"link"} className="cursor-pointer" asChild>
              <Link href="/archive">Archivés</Link>
            </Button>
            <input
              id={fileInputId}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                setImporting(true);
                setImportError(null);
                setImportDetails([]);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/contacts/import", {
                    method: "POST",
                    body: fd,
                  });
                  if (!res.ok) {
                    let message = "Import échoué";
                    let details: string[] = [];
                    try {
                      const json = await res.json();
                      message = json?.error || message;
                      details = Array.isArray(json?.details)
                        ? json.details
                        : [];
                    } catch {}
                    setImportError(message);
                    setImportDetails(details);
                  } else {
                    // Hard reload to revalidate and refresh all data/UI
                    window.location.reload();
                  }
                } catch (e) {
                  console.log("Import error:", e);
                  setImportError("Import échoué");
                } finally {
                  setImporting(false);
                  // reset input to allow reselecting same file
                  input.value = "";
                }
              }}
            />
            <Button
              variant={"link"}
              className="cursor-pointer"
              onClick={() => document.getElementById(fileInputId)?.click()}
            >
              {importing ? "Import…" : "Importer"}
            </Button>
            <Button
              variant={"link"}
              className="cursor-pointer"
              onClick={async () => {
                const res = await fetch("/api/contacts/export");
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "contacts.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Exporter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="cursor-pointer text-primary"
                >
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAccountOpen(true)}>
                  <User />
                  Compte
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/sign-in");
                        },
                      },
                    })
                  }
                >
                  <LogOut />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
      <ManageLabelsSheet open={labelsOpen} onOpenChange={setLabelsOpen} />
      <ManageNaturesSheet open={naturesOpen} onOpenChange={setNaturesOpen} />
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
      <Dialog
        open={!!importError}
        onOpenChange={(open) => !open && setImportError(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Erreur d’import</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-destructive">{importError}</p>
            {importDetails.length > 0 ? (
              <div className="max-h-64 overflow-auto rounded border p-2">
                <ul className="list-disc pl-5 text-sm">
                  {importDetails.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
