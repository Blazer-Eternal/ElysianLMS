import Link from "next/link";

const COLUMNS = [
  {
    label: "Platform",
    links: [
      { href: "/courses", label: "Course catalog" },
      { href: "/about", label: "About Elysian" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Elysian
          </span>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            A learning platform built around clear structure: published courses,
            quizzes with honest scoring, and progress you can actually see.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.label} aria-label={column.label}>
            <p className="label pb-3">{column.label}</p>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            © {new Date().getFullYear()} Elysian
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Learn with intention
          </p>
        </div>
      </div>
    </footer>
  );
}
