import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function isAuthenticated(): Promise<boolean> {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs,
  });

  return session ? true : false;
}

export const AuthLayer = {
  isAuthenticated,
};
