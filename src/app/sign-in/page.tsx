import SignIn from "@/components/auth/SignIn";
import Image from "next/image";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function SignInPage() {
    return (
        <div className="relative flex h-screen items-center justify-center overflow-hidden">
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
