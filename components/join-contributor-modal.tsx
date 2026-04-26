"use client";

import { useRef, useState, type FormEvent } from "react";

const phonePattern = /^(\+?1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$|^(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[\s.-]?\d{4}$/;

export function JoinContributorModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phone, setPhone] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function openModal() {
    setSubmitted(false);
    setError("");
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!phonePattern.test(phone.trim())) {
      setError("Use a valid Brazilian or US phone number.");
      return;
    }

    if (!githubHandle.trim()) {
      setError("Add your GitHub username.");
      return;
    }

    setError("");
    setSubmitted(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn-primary focus-themed inline-flex cursor-pointer rounded-lg px-4 py-2.5 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-90"
      >
        I want to participate
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-transparent p-0 text-primary backdrop:bg-black/55"
      >
        <div className="surface-panel rounded-2xl p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-xs uppercase brand-accent">Contributor request</p>
              <h3 className="mt-2 text-balance font-display text-[1.7rem] leading-[1.1] text-primary">
                Tell us how you want to help Synthosia.
              </h3>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close contributor form"
              className="focus-themed surface-raised grid size-9 cursor-pointer place-items-center rounded-full font-display text-sm text-secondary"
            >
              ×
            </button>
          </div>

          {submitted ? (
            <div className="surface-raised mt-6 rounded-xl p-5">
              <h4 className="font-display text-[1.25rem] text-primary">Thank you.</h4>
              <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.55] text-secondary">
                Your contributor request was received locally. The next step is connecting this form to a backend or CRM endpoint.
              </p>
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={submitForm}>
              <label className="grid gap-2">
                <span className="font-display text-sm text-secondary">Email</span>
                <input
                  required
                  type="email"
                  className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-display text-sm text-secondary">Phone number</span>
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
                  placeholder="+55 11 91234-5678 or +1 415 555 2671"
                />
              </label>

              <fieldset className="grid gap-2">
                <legend className="font-display text-sm text-secondary">Sex</legend>
                <div className="flex flex-wrap gap-3">
                  {["Male", "Female"].map((option) => (
                    <label key={option} className="surface-raised flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-display text-sm text-secondary">
                      <input required type="radio" name="sex" value={option} />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="grid gap-2">
                <span className="font-display text-sm text-secondary">GitHub link</span>
                <div className="focus-within:outline-violet-300 flex overflow-hidden rounded-lg border border-white/10 bg-[#050509] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2">
                  <span className="border-r border-white/10 px-3 py-2 font-mono text-sm text-muted">github.com/</span>
                  <input
                    required
                    value={githubHandle}
                    onChange={(event) => setGithubHandle(event.target.value.replace(/^https?:\/\/github\.com\//, ""))}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
                    placeholder="username"
                  />
                </div>
              </label>

              {error ? <p className="font-serif text-sm text-red-400">{error}</p> : null}

              <button
                type="submit"
                className="btn-primary focus-themed cursor-pointer rounded-lg px-4 py-2.5 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-90"
              >
                Send request
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
