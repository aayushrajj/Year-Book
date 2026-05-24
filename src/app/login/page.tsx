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
        <LoginForm colleges={colleges} />
      </div>
    </div>
  );
}
