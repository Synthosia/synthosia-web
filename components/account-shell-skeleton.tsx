/** Layout de carregamento do painel (sessão ou Suspense) — não bloqueia com ecrã vazio. */
export function AccountShellSkeleton() {
  return (
    <div className="account-panel-root flex min-h-dvh flex-col bg-[#F9FAFB]">
      <div className="h-14 shrink-0 border-b border-gray-200 bg-white">
        <div className="flex h-full items-center gap-3 px-4">
          <div className="h-8 w-28 animate-pulse rounded-md bg-gray-200" />
          <div className="hidden min-w-0 flex-1 md:block">
            <div className="h-9 max-w-xl animate-pulse rounded-md bg-gray-100" />
          </div>
          <div className="ms-auto flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden w-14 shrink-0 border-r border-gray-200 bg-[#F9FAFB] px-1 py-3 lg:flex lg:flex-col lg:items-center lg:gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="size-10 animate-pulse rounded-lg bg-gray-200/90" />
          ))}
        </div>
        <div className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-gray-200 p-4">
            <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-3">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100/90" />
              ))}
            </div>
          </div>
        </div>
        <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="h-4 max-w-md animate-pulse rounded bg-gray-200/80" />
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="h-40 max-w-4xl animate-pulse rounded-xl bg-gray-100" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-lg bg-white shadow-sm ring-1 ring-gray-100" />
              ))}
            </div>
            <div className="h-64 max-w-4xl animate-pulse rounded-xl bg-gray-100/80" />
          </div>
        </main>
      </div>
    </div>
  );
}
