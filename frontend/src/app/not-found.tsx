import { ButtonLink } from "@/components/ui/button";

/**
 * Root 404. Server component — needs no client runtime, just an
 * honest dead-end with two ways back into the site.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md">
        <p className="label">Error 404</p>
        <p className="mt-6 font-mono text-6xl leading-none tabular-nums text-pine">404</p>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          This page doesn’t exist
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-muted">
          The link may be old, or the course it pointed to was archived. The catalog is
          still open.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/courses" variant="secondary">
            Browse courses
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
