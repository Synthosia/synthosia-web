import React from "react";
import "./account.css";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-account min-h-dvh flex flex-col bg-[var(--page-bg)]">
      {children}
    </div>
  );
}
