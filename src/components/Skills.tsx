import { Brain, Code2, Database, Cloud, BarChart3, Users, Cpu, Layers } from "lucide-react";

const skillCategories = [
  {
    title: "Programming Languages",
    icon: Code2,
    skills: ["Python", "C/C++", "SQL", "JSON", "Kotlin", "Object-Oriented Design"],
  },
  {
    title: "GenAI & Agentic AI",
    icon: Brain,
    skills: ["Large Language Models (LLMs)", "LangChain", "LangGraph", "RAG", "Prompt Engineering", "Hallucination Mitigation"],
  },
  {
    title: "ML & NLP",
    icon: Cpu,
    skills: ["Machine Learning Pipelines", "Deep Learning", "NLP", "NLU", "Reinforcement Learning", "Model Validation", "CNNs"],
  },
  {
    title: "MLOps & Engineering",
    icon: Cloud,
    skills: ["Kubernetes", "AWS", "Azure", "CI/CD Pipelines", "Model Deployment", "Pipeline Optimisation", "TensorRT"],
  },
  {
    title: "Big Data & ETL",
    icon: Layers,
    skills: ["Hadoop", "Spark", "Kafka", "Data Processing Automation", "KPI Reporting"],
  },
  {
    title: "Databases & Tools",
    icon: Database,
    skills: ["MySQL", "Linux", "REST APIs", "Git", "Performance Monitoring", "API Integration"],
  },
  {
    title: "Business Intelligence",
    icon: BarChart3,
    skills: ["Power BI", "Tableau", "BigQuery", "KPI Analytics", "Reporting Automation", "Credit Analysis"],
  },
  {
    title: "Professional Strengths",
    icon: Users,
    skills: ["Stakeholder Communication", "Business Storytelling", "Product Analytics", "Cross-functional Collaboration", "Data Governance", "Agile / SDLC Practices"],
  },
];

export const Skills = () => {
  return (
    <section id="skills" className="py-20 px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Technical <span className="gradient-text">Skills</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="glass-card glow-hover rounded-2xl p-6 space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-muted/50 rounded-full text-sm border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      {skill}
                    </span>
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
