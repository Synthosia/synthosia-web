"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { getAccountSession } from "@/lib/synthosia-api";

export function AccountLink() {
  const { dictionary } = useLanguage();
  const [href, setHref] = useState("/auth/login");

  useEffect(() => {
    let isMounted = true;

    async function syncAccountLink() {
      try {
        const session = await getAccountSession();
        if (isMounted) {
          setHref(session ? "/account" : "/auth/login");
        }
      } catch {
        if (isMounted) {
          setHref("/auth/login");
        }
      }
    }

    syncAccountLink();
    window.addEventListener("synthosia-account-change", syncAccountLink);

    return () => {
      isMounted = false;
      window.removeEventListener("synthosia-account-change", syncAccountLink);
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
