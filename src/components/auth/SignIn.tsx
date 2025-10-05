"use client";

import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import z from "zod";
import { toast } from "sonner";
import { Button } from "../ui/button";

const SIGN_IN_FORM_SCHEMA = z.object({
  email: z.email({ message: "Email invalide" }).min(1, {
    message: "Email requis",
  }),
  password: z.string({ message: "Mot de passe requis" }).min(1, {
    message: "Mot de passe requis",
  }),
});

export default function SignIn() {
  const form = useForm<z.infer<typeof SIGN_IN_FORM_SCHEMA>>({
    resolver: zodResolver(SIGN_IN_FORM_SCHEMA),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof SIGN_IN_FORM_SCHEMA>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
        // name: "Deux Béliers",
        rememberMe: true,
      },
      {
        onError: (error) => {
          toast.error(error.error.message);
        },
      }
    );
  };

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connectez-vous à votre compte</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="self-end"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Connexion..." : "Connexion"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
