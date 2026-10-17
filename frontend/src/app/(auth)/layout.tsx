import Link from "next/link";

/**
 * Auth pages get an editorial split: a quiet brand panel (desktop only)
 * and a narrow form column. No footer chrome to compete with the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between border-r border-line bg-surface p-10 lg:flex xl:p-14">
        <Link href="/" className="group inline-flex w-fit items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-pine font-display text-lg leading-none font-semibold text-paper transition-transform duration-150 group-hover:-translate-y-0.5"
          >
            E
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Elysian
          </span>
        </Link>

        <div className="max-w-md">
          <p className="label pb-4">The Elysian method</p>
          <p className="font-display text-[2rem] leading-[1.15] font-medium text-ink">
            Courses with a spine: sections that build, quizzes that test, and
            progress that does not lie.
          </p>

          <ul className="mt-10 flex flex-col">
            {[
              ["01", "Enroll", "Free courses open instantly. Paid courses confirm through the admin queue."],
              ["02", "Learn", "Lessons in order, with preview lessons open to everyone."],
              ["03", "Prove it", "Quizzes are scored server-side, with a pass mark you can see."],
            ].map(([index, title, text]) => (
              <li key={index} className="rule-top mt-6 first:mt-0">
                <div className="flex gap-5">
                  <span className="font-mono text-xs text-pine">{index}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          © {new Date().getFullYear()} Elysian
        </p>
      </aside>

      {/* Form column */}
      <main id="main" className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            <span aria-hidden className="flex size-7 items-center justify-center rounded-md bg-pine font-display text-base font-semibold text-paper">
              E
            </span>
            Elysian
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
