import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm border border-line bg-white p-8">
        <Image src="/logo.png" alt="SS Clothing" width={190} height={185} className="mx-auto h-16 w-auto" preload />
        <h1 className="mt-5 text-center text-xl font-black uppercase tracking-tight">Admin login</h1>
        <LoginForm />
      </div>
    </main>
  );
}
