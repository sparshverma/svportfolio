import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ExperienceItem, type ExperienceEntry } from "./ExperienceItem";

const experiences: ExperienceEntry[] = [
  {
    title: "Founder & Lead Software Engineer",
    organization: "ZitBoard",
    period: "2026 — Present",
    type: "Founder",
    summary:
      "Built and shipped a full-stack SaaS from zero to 100+ active users — solo. No co-founder, no agency, no shortcuts.",
    highlights: [
      "Conceived, architected, and launched the entire product end-to-end, now serving 100+ active users.",
      "Engineered a high-performance marketing site and dashboard in vanilla HTML/CSS/JS — fast, accessible, and framework-free.",
      "Designed the backend from scratch with Node.js + Supabase (Postgres), provisioned via Bicep and Docker on Vercel and Azure.",
      "Built end-to-end Playwright + Python test pipelines wired into CI/CD, meaningfully cutting production regressions.",
      "Instrumented dataLayer events and automated SEO validation to surface funnel drop-offs before they hurt growth.",
    ],
    stack: ["Node.js", "Supabase", "Vercel", "Azure", "Docker", "Playwright", "Bicep"],
  },
  {
    title: "Data Analyst (Administrator)",
    organization: "Fuller, Smith & Turner",
    period: "2024 — 2025",
    type: "Data",
    summary:
      "Owned ML models, ETL, and BI dashboards across 127 business units — scoring 20k+ daily transactions and 4TB monthly data.",
    highlights: [
      "Built Python ML models auto-scoring 20,000+ daily transactions across 127 units for faster, consistent operations decisions.",
      "Designed end-to-end ETL on Apache Spark moving ~4TB monthly with same-day refresh — models never ran on stale data.",
      "Ran anomaly detection across millions of records, surfacing patterns that avoided ~$10K+ in losses per quarter.",
      "Shipped live Power BI KPI dashboards for leadership, replacing manual reporting and saving hours each week.",
      "Partnered with product, engineering, and business teams on ~2-week delivery cycles for models and reports.",
    ],
    stack: ["Python", "Apache Spark", "Power BI", "SQL", "ETL"],
  },
  {
    title: "AI Researcher",
    organization: "Queen Mary University of London",
    period: "2023 — 2024",
    type: "Academic",
    summary:
      "Researched intelligent threat detection at the intersection of AI and cybersecurity, culminating in the Cyber.ai paper.",
    highlights: [
      "Investigated ML approaches to automated threat detection in modern security systems.",
      "Published Cyber.ai, exploring AI-driven cybersecurity architectures.",
      "Built and evaluated model prototypes against real-world adversarial scenarios.",
    ],
    stack: ["Python", "PyTorch", "NLP", "Security"],
  },
  {
    title: "Brand Ambassador",
    organization: "Meraki, London",
    period: "2024",
    type: "Sales",
    summary:
      "Front-line ambassador for a HelloFresh campaign — hit personal-best sales records while lifting revenue meaningfully.",
    highlights: [
      "Drove a 25% first-month revenue lift on the HelloFresh campaign at Meraki.",
      "Set personal bests of 18 sales in a day and 41 sales in a week.",
      "Personalized recommendations grew repeat purchases 25% and overall revenue 30%.",
    ],
    stack: ["Sales", "Customer Engagement"],
  },
  {
    title: "Android App Developer",
    organization: "DeepStory, India",
    period: "2022",
    type: "Development",
    summary:
      "Front-end and MLOps for a social app startup — shipped Android features and tuned RL-based recommendations.",
    highlights: [
      "Built Android front-end features in Android Studio and helped design REST APIs on AWS.",
      "Owned MLOps in PyCharm, optimizing reinforcement learning pipelines.",
      "Improved recommendation-system accuracy by ~20% through algorithmic tuning.",
    ],
    stack: ["Kotlin", "Android Studio", "Python", "AWS", "REST"],
  },
];

export const Experience = () => {
  const [expanded, setExpanded] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const activeId = hovered ?? expanded;

  return (
    <section id="experience" className="py-16 sm:py-24 px-5 sm:px-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-primary/70 mb-3">
            Career Timeline
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Experience</span>
          </h2>
        </motion.div>

        <div ref={containerRef} className="relative">
          {/* Base timeline rail */}
          <div className="absolute left-[15px] sm:left-[19px] md:left-[35px] top-0 bottom-0 w-px bg-border/60" />
          {/* Scroll-linked neon draw */}
          {!reduce && (
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-[15px] sm:left-[19px] md:left-[35px] top-0 w-px origin-top"
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
                  boxShadow:
                    "0 0 12px hsl(var(--primary) / 0.7), 0 0 24px hsl(var(--primary) / 0.35)",
                }}
              />
            </motion.div>
          )}

          <div className="space-y-6 sm:space-y-8">
            {experiences.map((exp, i) => (
              <ExperienceRow
                key={exp.title}
                entry={exp}
                index={i}
                isExpanded={expanded === i}
                isFaded={activeId !== null && activeId !== i}
                setExpanded={setExpanded}
                setHovered={setHovered}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

type RowProps = {
  entry: ExperienceEntry;
  index: number;
  isExpanded: boolean;
  isFaded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<number>>;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
};

const ExperienceRow = ({ entry, index, isExpanded, isFaded, setExpanded, setHovered }: RowProps) => {
  const onToggle = useCallback(
    () => setExpanded((prev) => (prev === index ? -1 : index)),
    [index, setExpanded],
  );
  const onHover = useCallback(
    (h: boolean) => setHovered(h ? index : null),
    [index, setHovered],
  );
  return (
    <ExperienceItem
      entry={entry}
      index={index}
      isExpanded={isExpanded}
      isFaded={isFaded}
      onToggle={onToggle}
      onHover={onHover}
    />
  );
};
