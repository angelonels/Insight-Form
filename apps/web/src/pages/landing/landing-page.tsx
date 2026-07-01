import {
  ArrowRight,
  CaretRight,
  ChartBar,
  ChatText,
  Check,
  ClipboardText,
  FileText,
  List,
  ShieldCheck,
  Target,
  UsersThree,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageContainer } from "../../components/layout/page-container.js";
import { Section } from "../../components/layout/section.js";
import { ProductTourVideo } from "../../components/marketing/product-tour-video.js";
import { BrandLogo } from "../../components/brand/brand-logo.js";
import { buttonStyles } from "../../components/ui/button.js";

type IconComponent = Icon;

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Use cases", href: "#use-cases" },
] as const;

const journeySteps: Array<{ detail: string; icon: IconComponent; label: string }> = [
  { label: "Create", detail: "Start from a brief or a blank form.", icon: ClipboardText },
  { label: "Improve", detail: "Review wording, choices, and bias.", icon: ShieldCheck },
  { label: "Publish", detail: "Share a stable public form.", icon: Target },
  { label: "Collect", detail: "Keep every response in one inbox.", icon: UsersThree },
  { label: "Understand", detail: "See themes, sentiment, and drop-off.", icon: ChartBar },
  { label: "Ask", detail: "Question the response set directly.", icon: ChatText },
  { label: "Report", detail: "Create a clear, verifiable readout.", icon: FileText },
];

const audiences = [
  [
    "Students",
    "Research projects and campus feedback",
    "Move from survey answers to a defensible summary.",
  ],
  [
    "Event organizers",
    "Hackathons, workshops, and conferences",
    "Find what worked and what needs attention next.",
  ],
  [
    "Product builders",
    "Feature, beta, and onboarding feedback",
    "Separate repeated signals from isolated comments.",
  ],
  [
    "Startup founders",
    "Discovery interviews and early users",
    "Turn early feedback into the next decision.",
  ],
  [
    "Small teams",
    "Service reviews and internal feedback",
    "Run useful research without a dedicated research team.",
  ],
] as const;

export function LandingPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <LandingHeader />
      <HeroSection />
      <ProductSection />
      <AudienceSection />
      <WorkflowSection />
      <FinalCta />
    </main>
  );
}

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-raised/95 backdrop-blur-xl">
      <PageContainer className="relative flex h-[4.5rem] items-center justify-between gap-4">
        <Link className="flex items-center" to="/" aria-label="InsightForm home">
          <BrandLogo className="h-9 sm:h-10" />
        </Link>
        <nav
          aria-label="Landing page navigation"
          className="hidden h-full items-center gap-8 text-sm md:flex"
        >
          {navItems.map((item) => (
            <a
              className="inline-flex h-full items-center text-muted-foreground transition-colors hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link className={buttonStyles({ size: "sm" })} to="/app">
            Start building
          </Link>
          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-9 place-items-center rounded-lg border border-border bg-raised text-foreground md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <List className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {isMenuOpen ? (
          <nav
            className="absolute inset-x-5 top-[4.5rem] rounded-xl border border-border-subtle bg-raised p-2 shadow-soft md:hidden"
            aria-label="Mobile landing navigation"
          >
            {navItems.map((item) => (
              <a
                className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <CaretRight className="size-4" aria-hidden="true" />
              </a>
            ))}
          </nav>
        ) : null}
      </PageContainer>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="border-b border-border-subtle bg-raised">
      <PageContainer className="grid gap-8 pb-8 pt-10 sm:gap-12 sm:pb-20 sm:pt-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16 lg:py-20">
        <Reveal className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            From questions to evidence
          </p>
          <h1 className="max-w-[12ch] font-editorial text-5xl font-medium leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[4.75rem]">
            Forms that turn answers into action.
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Create focused forms, collect responses, and build findings you can trace back to the
            original answers.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonStyles({ size: "lg" })} to="/app">
              Start building
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a className={buttonStyles({ size: "lg", variant: "outline" })} href="#workflow">
              See the workflow
            </a>
          </div>
          <dl className="mt-9 hidden grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle py-4 sm:grid">
            <HeroMetric label="Draft" value="AI or manual" />
            <HeroMetric label="Review" value="Before publish" />
            <HeroMetric label="Evidence" value="Answers stay close" />
          </dl>
        </Reveal>
        <Reveal delay={0.08}>
          <ProductTourVideo />
        </Reveal>
      </PageContainer>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function ProductSection() {
  const capabilities = [
    [
      "Create a useful first draft",
      "Describe the audience and decision. Edit every question before anything goes live.",
      ClipboardText,
    ],
    [
      "Review question quality",
      "Find unclear wording, missing choices, and bias while the form is still easy to change.",
      ShieldCheck,
    ],
    [
      "Understand response patterns",
      "Summaries, sentiment, themes, and drop-off stay connected to the submitted answers.",
      ChartBar,
    ],
    [
      "Ask a follow-up question",
      "Query the response set and inspect the evidence behind the answer.",
      ChatText,
    ],
    [
      "Share the final readout",
      "Generate a structured report for the people who need to make the next decision.",
      FileText,
    ],
  ] as const;

  return (
    <Section className="bg-background py-6 sm:py-16 lg:py-24" id="product">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
          <Reveal>
            <h2 className="max-w-[14ch] font-editorial text-4xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-5xl">
              The form is only the beginning.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
              InsightForm keeps creation, collection, analysis, and reporting in one traceable
              workflow.
            </p>
          </Reveal>
          <div className="border-t border-border-subtle">
            {capabilities.map(([title, description, Icon], index) => (
              <Reveal
                className="grid gap-4 border-b border-border-subtle py-6 sm:grid-cols-[3rem_0.7fr_1.3fr] sm:items-start"
                delay={index * 0.035}
                key={title}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

function AudienceSection() {
  return (
    <Section className="border-y border-border-subtle bg-raised" id="use-cases">
      <PageContainer>
        <Reveal className="max-w-2xl">
          <h2 className="font-editorial text-4xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-5xl">
            Built for focused research, not process overhead.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The same workflow scales from a class project to customer discovery without adding team
            administration or analytics ceremony.
          </p>
        </Reveal>
        <div className="mt-10 overflow-hidden rounded-xl border border-border-subtle">
          {audiences.map(([audience, focus, outcome]) => (
            <div
              className="grid gap-2 border-b border-border-subtle bg-background p-4 last:border-b-0 sm:grid-cols-[0.45fr_0.85fr_1.2fr] sm:gap-6 sm:p-5"
              key={audience}
            >
              <h3 className="font-semibold">{audience}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{focus}</p>
              <p className="text-sm leading-6">{outcome}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}

function WorkflowSection() {
  return (
    <Section className="bg-background" id="workflow">
      <PageContainer>
        <Reveal className="max-w-3xl">
          <h2 className="font-editorial text-4xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-5xl">
            Create, improve, publish, collect, understand, ask, report.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Each step has a clear entry point, visible progress, a recoverable failure state, and an
            obvious next action.
          </p>
        </Reveal>
        <ol className="mt-10 border-t border-border-subtle">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                className="grid gap-3 border-b border-border-subtle py-5 sm:grid-cols-[3rem_3rem_0.55fr_1.45fr] sm:items-center"
                key={step.label}
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{step.label}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.detail}</p>
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </Section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-border-subtle bg-raised py-14 sm:py-20">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="max-w-2xl font-editorial text-4xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-5xl">
              Build the form. Keep the evidence. Make the next decision.
            </h2>
            <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              {[
                "Edit before publishing",
                "Use the sample workflow",
                "Trace findings to responses",
              ].map((item) => (
                <li className="flex items-center gap-2" key={item}>
                  <Check className="size-4 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link className={buttonStyles({ size: "lg" })} to="/app">
            Start building
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0.92, y: 8 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.05 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
