import SignIn from "@/components/auth/SignIn";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden">
      <Image
        className="absolute top-0 left-0 opacity-10"
        src="/cropped-icon-gold.svg"
        alt="Deux Béliers"
        height={1500}
        width={1500}
      />
      <SignIn />
    </div>
  );
}
