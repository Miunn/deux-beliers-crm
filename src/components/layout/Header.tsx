"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import ManageLabelsSheet from "../sheet/ManageLabels";
import ManageNaturesSheet from "../sheet/ManageNatures";
import { useSWRConfig } from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { User } from "lucide-react";
import AccountDialog from "../common/AccountDialog";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [naturesOpen, setNaturesOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const fileInputId = "__import_contacts_file_input";
  const { mutate } = useSWRConfig();

  return (
    <header className="bg-indigo-800 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <nav className="whitespace-nowrap flex items-center gap-3">
            {/* <Button variant={"link"} className="cursor-pointer text-white">
              Paramètres
            </Button> */}
            <Button
              onClick={() => setLabelsOpen(true)}
              variant={"link"}
              className="cursor-pointer text-white"
            >
              Libellés
            </Button>
            <Button
              onClick={() => setNaturesOpen(true)}
              variant={"link"}
              className="cursor-pointer text-white"
            >
              Nature d&apos;événement
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
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/contacts/import", {
                    method: "POST",
                    body: fd,
                  });
                  if (!res.ok) throw new Error("Import échoué");
                } catch (e) {
                  console.error(e);
                } finally {
                  setImporting(false);
                  // reset input to allow reselecting same file
                  input.value = "";
                  mutate("/api/contacts");
                }
              }}
            />
            <Button
              variant={"link"}
              className="cursor-pointer text-white"
              onClick={() => document.getElementById(fileInputId)?.click()}
            >
              {importing ? "Import…" : "Importer"}
            </Button>
            <Button
              variant={"link"}
              className="cursor-pointer text-white"
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
                  className="cursor-pointer"
                >
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAccountOpen(true)}>
                  <User />
                  Compte
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
      <ManageLabelsSheet open={labelsOpen} onOpenChange={setLabelsOpen} />
      <ManageNaturesSheet open={naturesOpen} onOpenChange={setNaturesOpen} />
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </header>
  );
}
