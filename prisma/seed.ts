import { auth } from "@/lib/auth";

async function main() {
  const r = await auth.api.signUpEmail({
    body: {
      email: "contact@deuxbeliers.fr",
      name: "Deux Béliers",
      password: "12345678",
    },
  });
  console.log("create user", r);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
