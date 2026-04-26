import type { Metadata } from "next";
import { AccountWorkspace } from "@/components/account-workspace";

export const metadata: Metadata = {
  title: "Account",
  description: "Synthosia account workspace for projects, API keys, integrations, and CLI connections.",
};

export default function AccountPage() {
  return (
    <div className="min-h-dvh">
      <AccountWorkspace />
    </div>
  );
}
