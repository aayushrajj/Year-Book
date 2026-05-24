import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getColleges } from "@/lib/colleges";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with your college email to enter your batch's yearbook.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/me");

  const colleges = await getColleges();

  return (
    <div className="container-narrow flex min-h-[calc(100vh-4rem)] items-center py-16">
      <div className="w-full">
        <h1 className="font-serif text-4xl leading-tight">Sign in.</h1>
        <p className="mt-3 max-w-md text-ink-500">
          A one-time link will land in your college inbox. No passwords.
        </p>
        <div className="mt-10">
          <LoginForm colleges={colleges} />
        </div>
      </div>
    </div>
  );
}
