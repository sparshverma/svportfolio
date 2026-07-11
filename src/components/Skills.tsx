import { useState } from "react";
import {
  Brain,
  Code2,
  Database,
  Cloud,
  BarChart3,
  Users,
  Cpu,
  Layers,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Network,
  Workflow,
  Cog,
  Activity,
  Plug,
  LineChart,
  ClipboardCheck,
  BookOpen,
  Rocket,
  Presentation,
  Boxes,
  Users2,
  FileCheck2,
  GitBranch,
  Eye,
  Blocks,
  type LucideIcon,
} from "lucide-react";

type Skill = {
  name: string;
  /** simpleicons slug for a brand logo, e.g. "python" */
  slug?: string;
  /** fallback lucide icon for concepts without a logo */
  icon?: LucideIcon;
};

const skillCategories: {
  title: string;
  icon: LucideIcon;
  skills: Skill[];
}[] = [
  {
    title: "Programming Languages",
    icon: Code2,
    skills: [
      { name: "Python", slug: "python" },
      { name: "C/C++", slug: "cplusplus" },
      { name: "Java", slug: "openjdk" },
      { name: "SQL", slug: "mysql" },
      { name: "TypeScript", slug: "typescript" },
      { name: "JSON", slug: "json" },
      { name: "Kotlin", slug: "kotlin" },
      { name: "Web3", slug: "web3dotjs" },
      { name: "Object-Oriented Design", icon: Blocks },
    ],
  },
  {
    title: "GenAI & Agentic AI",
    icon: Brain,
    skills: [
      { name: "Large Language Models (LLMs)", slug: "openai" },
      { name: "LangChain", slug: "langchain" },
      { name: "LangGraph", slug: "langgraph" },
      { name: "RAG", icon: BookOpen },
      { name: "Prompt Engineering", icon: MessageSquare },
      { name: "Hallucination Mitigation", icon: ShieldCheck },
    ],
  },
  {
    title: "ML & NLP",
    icon: Cpu,
    skills: [
      { name: "Machine Learning Pipelines", slug: "scikitlearn" },
      { name: "Deep Learning", slug: "pytorch" },
      { name: "NLP", slug: "huggingface" },
      { name: "NLU", icon: Sparkles },
      { name: "Reinforcement Learning", icon: Network },
      { name: "Model Validation", icon: ClipboardCheck },
      { name: "CNNs", slug: "tensorflow" },
    ],
  },
  {
    title: "MLOps & Engineering",
    icon: Cloud,
    skills: [
      { name: "Kubernetes", slug: "kubernetes" },
      { name: "AWS", slug: "amazonwebservices" },
      { name: "Azure", slug: "microsoftazure" },
      { name: "CI/CD Pipelines", slug: "githubactions" },
      { name: "Model Deployment", slug: "docker" },
      { name: "Pipeline Optimisation", icon: Cog },
      { name: "TensorRT", slug: "nvidia" },
    ],
  },
  {
    title: "Big Data & ETL",
    icon: Layers,
    skills: [
      { name: "Hadoop", slug: "apachehadoop" },
      { name: "Spark", slug: "apachespark" },
      { name: "Kafka", slug: "apachekafka" },
      { name: "Data Processing Automation", icon: Workflow },
      { name: "KPI Reporting", icon: LineChart },
    ],
  },
  {
    title: "Databases & Tools",
    icon: Database,
    skills: [
      { name: "MySQL", slug: "mysql" },
      { name: "Linux", slug: "linux" },
      { name: "REST APIs", icon: Plug },
      { name: "Git", slug: "git" },
      { name: "Performance Monitoring", icon: Activity },
      { name: "API Integration", slug: "postman" },
    ],
  },
  {
    title: "Business Intelligence",
    icon: BarChart3,
    skills: [
      { name: "Power BI", slug: "powerbi" },
      { name: "Tableau", slug: "tableau" },
      { name: "BigQuery", slug: "googlebigquery" },
      { name: "KPI Analytics", icon: LineChart },
      { name: "Reporting Automation", icon: FileCheck2 },
      { name: "Credit Analysis", icon: BarChart3 },
    ],
  },
  {
    title: "Professional Strengths",
    icon: Users,
    skills: [
      { name: "Stakeholder Communication", icon: Users2 },
      { name: "Business Storytelling", icon: Presentation },
      { name: "Product Analytics", icon: Eye },
      { name: "Cross-functional Collaboration", icon: Boxes },
      { name: "Data Governance", icon: ShieldCheck },
      { name: "Agile / SDLC Practices", icon: GitBranch },
    ],
  },
];

const SkillChip = ({ skill }: { skill: Skill }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const Fallback = skill.icon ?? Rocket;

  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-muted/50 rounded-full text-xs sm:text-sm leading-none border border-border/50 hover:border-primary/50 hover:bg-muted/70 transition-colors whitespace-nowrap">
      {skill.slug && !imgFailed ? (
        <img
          src={`https://cdn.simpleicons.org/${skill.slug}/00d9ff`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={14}
          height={14}
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Fallback className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-primary" aria-hidden="true" />
      )}
      <span>{skill.name}</span>
    </span>
  );
};

export const Skills = () => {
  return (
    <section id="skills" className="py-16 sm:py-20 px-5 sm:px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-12 text-center">
          Technical <span className="gradient-text">Skills</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="glass-card glow-hover rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col gap-4 animate-fade-in h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold leading-tight">
                    {category.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 content-start">
                  {category.skills.map((skill) => (
                    <SkillChip key={skill.name} skill={skill} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
