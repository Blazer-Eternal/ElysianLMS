import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Landing page. Editorial composition: one strong headline, real product
 * fragments instead of illustrations, ruled sections instead of card
 * grids. No gradients, no decorative badges, no fade-on-scroll.
 */
export default function LandingPage() {
  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <h1 className="font-display text-[clamp(2.5rem,5.6vw,4.25rem)] leading-[1.04] font-semibold tracking-[-0.015em] text-ink">
              A calm place to learn things properly.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              Elysian keeps online courses honest: sections that build in
              order, quizzes scored on the server, progress you can measure,
              and reviews written only by students who actually finished the
              course.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg" iconEnd="arrow-right">
                Create your account
              </ButtonLink>
              <ButtonLink href="/courses" size="lg" variant="secondary">
                Browse the catalog
              </ButtonLink>
            </div>

            <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              Free courses open instantly · No card required
            </p>
          </div>

          {/* Product fragments, built from real UI parts */}
          <div className="relative lg:pl-6">
            {/* Course card */}
            <div className="rounded-card border border-line bg-surface shadow-[0_1px_0_rgba(27,27,23,0.04)]">
              <div className="flex items-start gap-4 border-b border-line p-5">
                <span
                  aria-hidden
                  className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-pine-soft font-display text-2xl font-semibold text-pine"
                >
                  S
                </span>
                <div className="min-w-0">
                  <p className="label">Course · In progress</p>
                  <p className="mt-1 font-display text-lg leading-snug font-semibold text-ink">
                    Systems Thinking Foundations
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    Dr. Sarah Nolan · 6 sections · 24 lessons
                  </p>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full w-[62%] rounded-full bg-pine" />
                  </div>
                  <span className="font-mono text-xs tabular-nums text-ink-muted">62%</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-ink-muted">
                    <Icon name="play" size={14} className="text-pine" />
                    Lesson 9: Feedback loops
                  </span>
                  <span className="rounded-(--radius-control) border border-pine bg-pine px-3 py-1.5 text-xs font-medium text-paper">
                    Continue
                  </span>
                </div>
              </div>
            </div>

            {/* Quiz result, offset like a printed slip */}
            <div className="-mt-4 ml-auto w-[86%] rounded-card border border-line bg-surface shadow-[0_1px_0_rgba(27,27,23,0.04)] sm:-mt-6">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <p className="label">Quiz result</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-pine/35 bg-pine-soft px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-pine">
                  <Icon name="check" size={11} strokeWidth={2.2} />
                  Passed
                </span>
              </div>
              <div className="flex items-end gap-4 px-5 py-4">
                <p className="font-mono text-4xl leading-none tabular-nums text-ink">84</p>
                <p className="pb-1 text-[13px] text-ink-muted">
                  out of 100
                  <span className="block">Pass mark 70 · Attempt 2 of 3</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Capability band -------------------------- */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-4 md:divide-x lg:px-10">
          {[
            ["Scored server-side", "Correct answers never leave the server before submission."],
            ["Verified reviews", "Only enrolled students can review, one review per course."],
            ["eSewa & Khalti", "Paid courses confirm through a reconciliation queue."],
            ["Instructors and TAs", "Co-teachers and assistants share a course workspace."],
          ].map(([title, text]) => (
            <div key={title} className="px-0 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-pine">
                {title}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------- How it works ---------------------------- */}
      <section id="how-it-works" className="border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10 lg:py-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="label pb-4">How it works</p>
            <h2 className="font-display text-[2rem] leading-tight font-semibold text-ink sm:text-[2.5rem]">
              Four steps, start to finish.
            </h2>
            <p className="mt-4 text-[15px] leading-6 text-ink-muted">
              Nothing hidden, nothing gamified. You always know where you
              stand in a course.
            </p>
          </div>

          <ol className="flex flex-col">
            {[
              [
                "01",
                "Enroll",
                "Free courses open the moment you click enroll. Paid courses create an order that an admin confirms, and enrollment unlocks as soon as the payment is marked paid.",
              ],
              [
                "02",
                "Learn in order",
                "Courses are sections of lessons: reading, video, and preview lessons anyone can watch before enrolling. Each completed lesson is recorded as progress.",
              ],
              [
                "03",
                "Prove it with quizzes",
                "Every quiz has a published pass mark. Answers are submitted once, scored on the server, and your attempts and best scores stay visible.",
              ],
              [
                "04",
                "Review what you took",
                "Finished a course? Leave a rating and a comment. Reviews are tied to real enrollments, so the average on a course page means something.",
              ],
            ].map(([index, title, text]) => (
              <li key={index} className="rule-top mt-8 first:mt-0">
                <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[3rem_1fr]">
                  <span className="font-mono text-sm text-pine">{index}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
                    <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted">{text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------ Two sides ----------------------------- */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <p className="label pb-4">For learners</p>
            <h2 className="font-display text-[1.9rem] leading-tight font-semibold text-ink">
              Know exactly how far you are.
            </h2>
            <ul className="mt-6 flex flex-col">
              {[
                ["Progress per course", "Completed lessons, percent done, and your resume point on one dashboard."],
                ["Honest results", "Quiz scores, pass marks, and attempt history in plain numbers."],
                ["Your workspace", "Enrollments, pending orders, and review reminders in one place."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-4 border-t border-line py-4 first:border-t-0 first:pt-0">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine">
                    <Icon name="check" size={13} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-ink-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label pb-4">For teachers</p>
            <h2 className="font-display text-[1.9rem] leading-tight font-semibold text-ink">
              A builder that stays out of the way.
            </h2>
            <ul className="mt-6 flex flex-col">
              {[
                ["Outline first", "Sections and lessons reorder with explicit moves, not drag guesswork."],
                ["Quizzes attached to lessons", "Two to eight options per question, one correct answer, a pass mark you set."],
                ["Review before publish", "Submit a draft for review, fix what gets rejected, archive when done."],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-4 border-t border-line py-4 first:border-t-0 first:pt-0">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-pine-soft text-pine">
                    <Icon name="check" size={13} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-ink-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="rounded-card bg-pine px-6 py-12 sm:px-12 lg:py-16">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <h2 className="font-display text-[2rem] leading-tight font-semibold text-paper sm:text-[2.6rem]">
                  Pick a course. Start today.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-paper/85">
                  Create an account in a minute, or browse the catalog first.
                  Free courses are open the moment you enroll.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink
                  href="/register"
                  size="lg"
                  variant="secondary"
                  className="border-paper bg-paper text-pine hover:border-white hover:bg-white"
                >
                  Create account
                </ButtonLink>
                <ButtonLink
                  href="/courses"
                  size="lg"
                  variant="quiet"
                  className="border-paper/40 text-paper hover:border-paper hover:bg-pine-deep hover:text-paper"
                >
                  Browse catalog
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
