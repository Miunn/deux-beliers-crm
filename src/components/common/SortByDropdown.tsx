import {
  ArrowDownWideNarrow,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export enum ContactSortMethod {
  NameAsc = "NAME_ASC",
  NameDesc = "NAME_DESC",
  RappelAsc = "RAPPEL_ASC",
  RappelDesc = "RAPPEL_DESC",
}

export default function SortByDropdown({
  sortState,
  setSortState,
}: {
  sortState: ContactSortMethod;
  setSortState: React.Dispatch<React.SetStateAction<ContactSortMethod>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} className="w-32">
          <ArrowDownWideNarrow className="mr-2" />
          Trier par
          <ChevronDown
            className="-me-1 ms-2 opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={(event) => {
            event.preventDefault();
            if (sortState === ContactSortMethod.NameDesc) {
              setSortState(ContactSortMethod.NameAsc);
            } else {
              setSortState(ContactSortMethod.NameDesc);
            }
          }}
        >
          Nom
          {sortState === ContactSortMethod.NameAsc ? (
            <ArrowUp className="w-4 h-4" />
          ) : null}
          {sortState === ContactSortMethod.NameDesc ? (
            <ArrowDown className="w-4 h-4" />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={(event) => {
            event.preventDefault();
            if (sortState === ContactSortMethod.RappelDesc) {
              setSortState(ContactSortMethod.RappelAsc);
            } else {
              setSortState(ContactSortMethod.RappelDesc);
            }
          }}
        >
          Date de rappel
          {sortState === ContactSortMethod.RappelAsc ? (
            <ArrowUp className="w-4 h-4" />
          ) : null}
          {sortState === ContactSortMethod.RappelDesc ? (
            <ArrowDown className="w-4 h-4" />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
