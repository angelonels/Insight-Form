import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Lightbulb,
  Menu,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { Link } from "react-router-dom";

import { PageContainer } from "../../components/layout/page-container.js";
import { Section } from "../../components/layout/section.js";
import { Badge } from "../../components/ui/badge.js";
import { buttonStyles } from "../../components/ui/button.js";
import { Card } from "../../components/ui/card.js";
import { cn } from "../../lib/utils/cn.js";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Reports", href: "#reports" },
] as const;

const journeySteps = [
  { label: "Create", detail: "Start from scratch or use a helpful first draft.", icon: ClipboardList },
  { label: "Improve", detail: "Tighten wording and answer choices before people see it.", icon: ShieldCheck },
  { label: "Publish", detail: "Share the form when it is ready.", icon: Target },
  { label: "Collect", detail: "Bring every response into one place.", icon: UsersRound },
  { label: "Understand", detail: "See themes, sentiment, and drop-offs.", icon: BarChart3 },
  { label: "Ask", detail: "Ask follow-up questions about the results.", icon: MessageSquareText },
  { label: "Report", detail: "Share a clean readout when the work is done.", icon: FileText },
] as const;

const featureHighlights: Array<{
  title: string;
  description: string;
  icon: IconComponent;
  proof: string;
}> = [
  {
    title: "Start with a rough idea",
    description: "Describe what you want to learn. InsightForm gives you a first draft you can edit before it goes live.",
    icon: Sparkles,
    proof: "Editable draft",
  },
  {
    title: "Ask better questions",
    description: "Find leading wording, missing choices, long prompts, and confusing scales before people see the form.",
    icon: ShieldCheck,
    proof: "Quality check",
  },
  {
    title: "Read answers faster",
    description: "See themes, sentiment, requests, and drop-off signals while the original answers stay close.",
    icon: BarChart3,
    proof: "Original answers",
  },
  {
    title: "Ask follow-up questions",
    description: "Ask a question about the responses and get a clear answer with the matching answers beside it.",
    icon: MessageSquareText,
    proof: "Easy to check",
  },
  {
    title: "Share a clean report",
    description: "Turn the final readout into a report your team can review, copy, or export.",
    icon: FileText,
    proof: "Report ready",
  },
] as const;

const useCases = [
  {
    user: "Students",
    focus: "Class research, campus surveys, interview notes",
    outcome: "Go from raw answers to a clear readout.",
  },
  {
    user: "Event organizers",
    focus: "Hackathons, workshops, meetups, conferences",
    outcome: "Spot what worked, what broke, and what to change next.",
  },
  {
    user: "Product builders",
    focus: "Feature feedback, beta programs, onboarding surveys",
    outcome: "See the few signals that matter most.",
  },
  {
    user: "Startup founders",
    focus: "Customer discovery, waitlists, early users",
    outcome: "Turn early feedback into the next decision.",
  },
  {
    user: "Small teams",
    focus: "Service reviews, internal feedback, quick polls",
    outcome: "Run useful research without a research team.",
  },
] as const;

const valuePoints = [
  "Write questions people can answer clearly.",
  "Find the themes that keep coming up.",
  "Share a report your team can trust.",
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <LandingHeader />
      <HeroSection />
      <ValueSection />
      <FeatureSection />
      <UseCaseSection />
      <WorkflowSection />
      <FinalCtaSection />
    </main>
  );
}

function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <PageContainer className="relative flex h-16 items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3" aria-label="InsightForm home">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-panel">
            <PenLine className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-normal">InsightForm</span>
        </a>

        <nav aria-label="Landing page navigation" className="hidden items-center gap-7 text-sm md:flex">
          {navItems.map((item) => (
            <a key={item.href} className="text-muted-foreground transition-colors hover:text-foreground" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link aria-label="Start free" className={buttonStyles({ size: "sm" })} to="/app">
            Start<span className="hidden sm:inline"> free</span>
          </Link>
          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-foreground md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="absolute left-5 right-5 top-[4.5rem] rounded-lg border border-border bg-card p-2 shadow-soft md:hidden">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <ChevronRight className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}
      </PageContainer>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative border-b border-border/70 bg-[radial-gradient(circle_at_82%_22%,hsl(var(--secondary)/0.65),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_62%,hsl(var(--card))_100%)]">
      <PageContainer className="grid gap-8 pb-10 pt-9 sm:pb-14 sm:pt-14 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-20">
        <Reveal className="max-w-2xl">
          <p className="mb-5 hidden rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase text-accent-foreground shadow-panel sm:inline-flex">
            Forms, answers, and reports in one place
          </p>
          <h1 className="max-w-none text-4xl font-semibold leading-[1.04] tracking-normal text-foreground sm:max-w-[12ch] sm:text-5xl lg:max-w-[11ch] lg:text-6xl xl:text-7xl">
            Forms that turn answers into action.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Build clean forms, collect responses, and get clear summaries your team can act on.
          </p>
          <div className="mt-7 grid gap-3 sm:flex">
            <MotionLink className={buttonStyles({ size: "lg", className: "min-h-12" })} to="/app">
              Start building
              <ArrowRight className="size-4" aria-hidden="true" />
            </MotionLink>
            <MotionAnchor
              className={buttonStyles({ size: "lg", variant: "outline", className: "min-h-12" })}
              href="#workflow"
            >
              See the workflow
            </MotionAnchor>
          </div>
          <HeroProofStrip />
        </Reveal>

        <Reveal delay={0.12}>
          <ProductCockpit />
        </Reveal>
      </PageContainer>
    </section>
  );
}

function HeroProofStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.dl
      className="mt-7 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-border bg-card shadow-panel"
      initial={shouldReduceMotion ? false : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      viewport={{ once: true, amount: 0.5 }}
      whileInView={shouldReduceMotion ? undefined : "visible"}
    >
      <HeroMetric label="Build" value="Better forms" />
      <HeroMetric label="Learn" value="Clear takeaways" />
      <HeroMetric label="Share" value="Clean reports" />
    </motion.dl>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      className="border-r border-border px-3 py-3 last:border-r-0 sm:px-4 sm:py-4"
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <dt className="hidden text-[0.66rem] font-semibold uppercase leading-4 text-muted-foreground sm:block sm:text-xs">{label}</dt>
      <dd className="text-sm font-semibold leading-5 text-foreground sm:mt-1 sm:text-base">{value}</dd>
    </motion.div>
  );
}

function ProductCockpit() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto max-w-2xl lg:max-w-none" aria-label="InsightForm product preview">
      <div className="absolute inset-x-10 top-8 hidden h-28 rounded-[48px] bg-accent/10 blur-3xl sm:block" />
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
        className="relative rounded-xl border border-border bg-card p-3 shadow-soft"
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Hackathon Feedback</p>
            <p className="text-xs text-muted-foreground">Autosaved</p>
          </div>
          <motion.div
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
            className="shrink-0"
            transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
          >
            <Badge tone="success">Looks good</Badge>
          </motion.div>
        </div>

        <div className="grid gap-3 p-2 sm:p-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3 rounded-lg border border-border bg-background p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Form preview</p>
                <h2 className="mt-1 text-lg font-semibold">Event feedback</h2>
              </div>
              <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                Preview
              </span>
            </div>

            <QuestionPreview title="How was the event overall?" meta="Rating scale, required" active />
            <QuestionPreview title="What should we keep?" meta="Long answer" />
            <QuestionPreview
              className="hidden sm:block"
              title="What should we fix next time?"
              meta="Checkbox options"
            />
          </div>

          <div className="grid gap-3">
            <ActiveAiCard />
            <InsightSummaryCard />
            <FollowUpAnswerCard />
          </div>
        </div>
      </motion.div>
      <JourneyRibbon />
    </div>
  );
}

function ActiveAiCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-lg bg-primary p-4 text-primary-foreground"
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4" aria-hidden="true" />
        <p className="text-sm font-semibold">Suggested fix</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
        Add a neutral choice so people can answer honestly.
      </p>
    </motion.div>
  );
}

function InsightSummaryCard() {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">What changed</p>
      <p className="mt-2 text-sm font-semibold">People loved the mentors. Wi-Fi was the main issue.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <InsightChip value="42" label="answers" />
        <InsightChip value="68%" label="positive" />
        <InsightChip value="9" label="follow-ups" />
      </div>
    </div>
  );
}

function FollowUpAnswerCard() {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Follow-up answer</p>
      <p className="mt-2 text-sm leading-6">Main issue: Wi-Fi. 14 responses mention drops or slow speeds.</p>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-accent-foreground">
        <span className="size-2 rounded-full bg-accent" />
        View responses
      </div>
    </div>
  );
}

function JourneyRibbon() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-2 -mt-3 grid grid-cols-7 overflow-hidden rounded-lg border border-border bg-card shadow-panel sm:mx-8">
      {journeySteps.map((step, index) => (
        <motion.div
          key={step.label}
          className={cn(
            "min-w-0 border-r border-border px-1.5 py-3 text-center last:border-r-0 sm:px-2",
            index === 1 && "bg-secondary",
          )}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          transition={{ delay: index * 0.035, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.5 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <p className="text-[0.52rem] font-semibold uppercase leading-4 text-muted-foreground sm:text-[0.62rem] lg:text-[0.58rem] xl:text-[0.66rem]">
            {step.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function QuestionPreview({
  active = false,
  className,
  meta,
  title,
}: {
  active?: boolean;
  className?: string;
  meta: string;
  title: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("rounded-lg border bg-card p-3", active ? "border-accent/45" : "border-border", className)}
      whileHover={shouldReduceMotion ? undefined : { x: 2 }}
      transition={{ type: "spring", stiffness: 360, damping: 26 }}
    >
      <div className="flex items-start gap-3">
        <motion.span
          animate={active && !shouldReduceMotion ? { scale: [1, 1.35, 1] } : undefined}
          className={cn("mt-1 size-2 rounded-full", active ? "bg-accent" : "bg-muted-foreground/35")}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
        />
        <div>
          <p className="text-sm font-medium leading-6">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightChip({ label, value }: { label: string; value: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-md bg-muted px-2 py-2"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 360, damping: 25 }}
    >
      <p className="text-sm font-semibold">{value}</p>
      <p className="mt-1 text-[0.68rem] leading-3 text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function ValueSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section id="product" className="bg-primary py-14 text-primary-foreground sm:py-20 lg:py-24">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <Reveal>
            <p className="text-sm font-semibold uppercase text-secondary">Why it exists</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              Forms are easy. Knowing what to do next is harder.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-3xl text-xl leading-9 text-primary-foreground">
              InsightForm helps you ask better questions, understand the answers faster, and share
              what matters.
            </p>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {valuePoints.map((point, index) => (
                <motion.div
                  key={point}
                  className="rounded-lg border border-primary-foreground/14 bg-primary-foreground/[0.07] p-4"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  transition={{ delay: index * 0.05, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, amount: 0.35 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                >
                  <CheckCircle2 className="size-5 text-secondary" aria-hidden="true" />
                  <p className="mt-3 text-sm leading-6 text-primary-foreground/76">{point}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </PageContainer>
    </Section>
  );
}

function FeatureSection() {
  return (
    <Section className="bg-card">
      <PageContainer>
        <Reveal className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-accent-foreground">What it does</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            A cleaner way to handle feedback.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Build the form, review the answers, ask follow-up questions, and share the report
            without jumping between tools.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.15fr_0.9fr_0.9fr]">
          {featureHighlights.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} featured={index === 0} index={index} />
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}

function FeatureCard({
  feature,
  featured,
  index,
}: {
  feature: (typeof featureHighlights)[number];
  featured: boolean;
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.28 }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      <Card className={cn("h-full p-5", featured && "bg-background md:row-span-2 lg:min-h-[23rem]")}>
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <feature.icon className="size-5" aria-hidden="true" />
          </span>
          <Badge tone="neutral">{feature.proof}</Badge>
        </div>
        <h3 className={cn("mt-6 font-semibold leading-tight", featured ? "text-2xl" : "text-lg")}>{feature.title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
      </Card>
    </motion.div>
  );
}

function UseCaseSection() {
  return (
    <Section id="use-cases" className="bg-background">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <UsersRound className="size-9 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              For anyone who needs the answer, not just the form.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              No workspace setup. No heavy process. Just a form, the responses, and the readout.
            </p>
          </Reveal>

          <div className="grid gap-3">
            {useCases.map((useCase, index) => (
              <Reveal key={useCase.user} delay={index * 0.04}>
                <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-panel md:grid-cols-[0.36fr_0.64fr]">
                  <div>
                    <h3 className="text-base font-semibold">{useCase.user}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{useCase.focus}</p>
                  </div>
                  <p className="text-sm leading-6 text-foreground">{useCase.outcome}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

function WorkflowSection() {
  return (
    <Section id="workflow" className="bg-card">
      <PageContainer>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-accent-foreground">Workflow preview</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Create, improve, publish, collect, understand, ask, report.
            </h2>
          </Reveal>
          <MotionAnchor className={buttonStyles({ variant: "outline" })} href="#reports">
            View reports
          </MotionAnchor>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {journeySteps.map((step, index) => (
            <WorkflowStep key={step.label} index={index} step={step} />
          ))}
        </div>

        <ReportPreview />
      </PageContainer>
    </Section>
  );
}

function WorkflowStep({ index, step }: { index: number; step: (typeof journeySteps)[number] }) {
  const StepIcon = step.icon;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      transition={{ delay: index * 0.045, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.3 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      <div className={cn("h-full rounded-lg border border-border bg-background p-4", index === 4 && "border-accent/45 bg-secondary/40")}>
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
            <StepIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-5 text-base font-semibold">{step.label}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
      </div>
    </motion.div>
  );
}

function ReportPreview() {
  return (
    <Reveal
      id="reports"
      className="mt-8 grid gap-4 rounded-lg border border-border bg-background p-5 shadow-panel lg:grid-cols-[0.78fr_1.22fr]"
    >
      <div>
        <Lightbulb className="size-7 text-warning" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-semibold">Reports stay easy to trust.</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Preview, edit, copy, and export a clean report with the real answers close by.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <p className="font-semibold">Summary report</p>
          <Badge tone="accent">Ready</Badge>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          <p>Mentors were the strongest part of the event.</p>
          <p>Wi-Fi was the biggest issue, with 14 linked responses mentioning drops or slow speeds.</p>
        </div>
      </div>
    </Reveal>
  );
}

function FinalCtaSection() {
  return (
    <Section className="bg-primary py-14 text-primary-foreground sm:py-20">
      <PageContainer>
        <Reveal className="rounded-lg border border-primary-foreground/14 bg-primary-foreground/[0.07] p-6 shadow-soft sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Build the form. Read the answers. Know what to do next.
              </h2>
              <p className="mt-4 text-base leading-7 text-primary-foreground/72">
                Start with a blank form or a guided first draft. Edit everything before you publish.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <MotionLink className={buttonStyles({ size: "lg", variant: "secondary" })} to="/app">
                Start building
                <ArrowRight className="size-4" aria-hidden="true" />
              </MotionLink>
              <MotionAnchor
                className={buttonStyles({ size: "lg", variant: "outline", className: "border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" })}
                href="#product"
              >
                See product
              </MotionAnchor>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </Section>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      transition={{ delay, duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.25 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function MotionLink({
  children,
  className,
  to,
}: {
  children: ReactNode;
  className?: string;
  to: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <Link className={cn(className, "w-full")} to={to}>
        {children}
      </Link>
    </motion.div>
  );
}

function MotionAnchor({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <a className={cn(className, "w-full")} href={href}>
        {children}
      </a>
    </motion.div>
  );
}
