"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { GitHubIcon, GoogleIcon, KeyIcon, ShieldIcon, TerminalIcon } from "@/components/auth-icons";
import { loginAccount, registerAccount, startGithubOAuth } from "@/lib/synthosia-api";

type AuthMode = "login" | "register";

type AuthFormsProps = {
  mode: AuthMode;
};

const providerConfig = {
  google: {
    label: "Continue with Google",
    name: "Google user",
    email: "google-user@synthosia.local",
    icon: GoogleIcon,
  },
  github: {
    label: "Continue with GitHub",
    name: "GitHub user",
    email: "github-user@synthosia.local",
    icon: GitHubIcon,
  },
} as const;

export function AuthForms({ mode }: AuthFormsProps) {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login() {
    if (!loginEmail.trim() || loginPassword.length < 8) {
      setMessage("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAccount({ email: loginEmail.trim(), password: loginPassword });
      setMessage("Login completed.");
      router.push("/account");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function register() {
    const name = registerName.trim();
    const email = registerEmail.trim();

    if (!name || !email || registerPassword.length < 8) {
      setMessage("Enter name, email, and a password with at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAccount({ name, email, password: registerPassword });
      setMessage("Account created.");
      router.push("/account");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function continueWithProvider(provider: keyof typeof providerConfig) {
    const selectedProvider = providerConfig[provider];

    if (provider === "github") {
      try {
        await startGithubOAuth();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to start GitHub OAuth.");
      }
      return;
    }

    setMessage(`${selectedProvider.name} OAuth is ready in the API contract and will be connected after provider credentials are configured.`);
  }

  return (
    <motion.div
      className="surface-panel rounded-[24px] p-5 shadow-lg sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Private", icon: ShieldIcon },
          { label: "Keys", icon: KeyIcon },
          { label: "CLI", icon: TerminalIcon },
        ].map((item) => (
          <div key={item.label} className="surface-raised rounded-xl p-2.5 sm:p-3">
            <item.icon className="size-4 brand-accent" />
            <p className="mt-2 font-display text-xs text-secondary">{item.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="font-display text-xs uppercase brand-accent">
          {mode === "login" ? "Sign in" : "Create workspace"}
        </p>
        <h2 className="mt-2 text-balance font-display text-[1.85rem] leading-[1.08] text-primary sm:text-[2rem]">
          {mode === "login" ? "Access your account." : "Start your account."}
        </h2>
        <p className="mt-2 text-pretty font-serif text-[0.98rem] leading-[1.45] text-secondary">
          {mode === "login"
            ? "Use a connected provider or your local account email to continue."
            : "Create the local account now and keep OAuth-ready access available."}
        </p>
      </div>

      <div className="mt-5 grid gap-2.5">
        {(Object.keys(providerConfig) as Array<keyof typeof providerConfig>).map((provider) => {
          const ProviderIcon = providerConfig[provider].icon;

          return (
            <motion.button
              key={provider}
              type="button"
              onClick={() => continueWithProvider(provider)}
              whileTap={{ scale: 0.98 }}
              className="focus-themed surface-raised flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-3 font-display text-sm text-primary transition duration-150 ease-out hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-white text-[#09070f]">
                  <ProviderIcon className="size-5" />
                </span>
                {providerConfig[provider].label}
              </span>
              <span className="font-mono text-xs text-muted">OAuth</span>
            </motion.button>
          );
        })}
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-xs uppercase text-muted">or use email</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {mode === "login" ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
        >
          <div>
            <h3 className="font-display text-[1.3rem] text-primary">Email login</h3>
            <p className="mt-1 font-serif text-[0.95rem] text-secondary">Use your local account email.</p>
          </div>
          <label className="block space-y-2">
            <span className="font-display text-sm text-secondary">Email</span>
            <input
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
              placeholder="you@synthosia.dev"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-display text-sm text-secondary">Password</span>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary focus-themed w-full cursor-pointer rounded-lg px-4 py-2.5 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-90"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
          <p className="font-serif text-sm text-secondary">
            Need an account?{" "}
            <Link href="/auth/register" className="font-display brand-accent">
              Create one
            </Link>
          </p>
        </form>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            register();
          }}
        >
          <div>
            <h3 className="font-display text-[1.3rem] text-primary">Email account</h3>
            <p className="mt-1 font-serif text-[0.95rem] text-secondary">Create your local platform identity.</p>
          </div>
          <label className="block space-y-2">
            <span className="font-display text-sm text-secondary">Name</span>
            <input
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
              placeholder="Developer name"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-display text-sm text-secondary">Work email</span>
            <input
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
              placeholder="team@synthosia.dev"
            />
          </label>
          <label className="block space-y-2">
            <span className="font-display text-sm text-secondary">Password</span>
            <input
              type="password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
              placeholder="At least 8 characters"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary focus-themed w-full cursor-pointer rounded-lg px-4 py-2.5 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-90"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
          <p className="font-serif text-sm text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-display brand-accent">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {message ? (
        <p className="surface-raised mt-6 rounded-lg px-3 py-2 font-serif text-[1rem] text-secondary">
          {message}
        </p>
      ) : null}
    </motion.div>
  );
}
