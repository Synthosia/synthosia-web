"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { readAccountSession } from "@/lib/account-session";

export function AccountLink() {
  const { dictionary } = useLanguage();
  const [href, setHref] = useState("/auth/login");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHref(readAccountSession() ? "/account" : "/auth/login");
    });

    function syncAccountLink() {
      setHref(readAccountSession() ? "/account" : "/auth/login");
    }

    window.addEventListener("synthosia-account-change", syncAccountLink);
    window.addEventListener("storage", syncAccountLink);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("synthosia-account-change", syncAccountLink);
      window.removeEventListener("storage", syncAccountLink);
    };
  }, []);

  return (
    <Link
      href={href}
      className="btn-secondary focus-themed rounded-lg px-3.5 py-2 font-display text-sm transition-colors duration-150 ease-out hover:opacity-85"
    >
      {dictionary.header.account}
    </Link>
  );
}
