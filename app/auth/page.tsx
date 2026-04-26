import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Auth",
  description: "Login and registration for the Synthosia account system.",
};

export default function AuthPage() {
  redirect("/auth/login");
}
