import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Elysian is, how courses move from draft to published, and the rules students and instructors can rely on.",
};

const PRINCIPLES: Array<[string, string]> = [
  [
    "Published means reviewed",
    "A course starts as a draft. The instructor submits it, an admin reads it, and it goes live only after approval. A course without content cannot reach the queue at all.",
  ],
  [
    "Scores stay on the server",
    "Quiz answers are submitted once and scored by the backend. Correct options are never sent to the browser before submission, so there is nothing to peek at.",
  ],
  [
    "Reviews require enrollment",
    "Only students enrolled in a published course can review it, one review each, editable and deletable by their author. The average on a course page comes from real participation.",
  ],
  [
    "Roles are explicit",
    "Students learn, instructors author, admins arbitrate. Teaching access is per course: assistants and co-teachers are added to a course, not promoted platform-wide.",
  ],
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="label pb-4">About</p>
          <h1 className="max-w-3xl font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.08] font-semibold text-ink">
            Online learning with the guesswork removed.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-8 text-ink-muted">
            Elysian is a learning platform for people who want structure
            instead of streaks: courses that go through review before anyone
            sees them, quizzes that cannot be gamed from the browser, and
            progress that reflects work actually done.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="label pb-4">Principles</p>
              <h2 className="font-display text-[2rem] leading-tight font-semibold text-ink">
                The rules everyone can rely on.
              </h2>
            </div>

            <ul className="flex flex-col">
              {PRINCIPLES.map(([title, text], index) => (
                <li key={title} className="rule-top mt-8 first:mt-0">
                  <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[3rem_1fr]">
                    <span className="font-mono text-sm text-pine">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
                      <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-muted">
                        {text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="label pb-6">Who it is for</p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              [
                "Learners",
                "Enroll, watch or read lessons in order, mark progress honestly, and know your quiz standing at a glance. Free courses cost nothing but an account.",
              ],
              [
                "Instructors",
                "Build a curriculum section by section, attach quizzes with a pass mark you choose, and submit for review when it is ready. Assistants help per course.",
              ],
              [
                "Administrators",
                "Approve or reject courses, confirm payments through a reconciliation queue, adjust roles, and keep an eye on the platform with a live dashboard.",
              ],
            ].map(([title, text]) => (
              <div key={title} className="rule-top">
                <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
                <p className="mt-2.5 text-[15px] leading-7 text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-[2rem] leading-tight font-semibold text-ink">
              See it with an account.
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-muted">
              Registration takes a minute, and free courses open the moment
              you enroll.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg" iconEnd="arrow-right">
              Create account
            </ButtonLink>
            <ButtonLink href="/courses" size="lg" variant="secondary">
              Browse catalog
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
