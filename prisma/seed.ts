import { auth } from "@/lib/auth";

async function main() {
  const r = await auth.api.signUpEmail({
    body: {
      email: "contact@deuxbeliers.fr",
      name: "Deux Béliers",
      password: "12345678",
    },
  });
  console.log(r);
}

main();
