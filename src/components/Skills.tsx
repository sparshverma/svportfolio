import { Brain, Code2, Smartphone, Database, Cloud, GitBranch } from "lucide-react";

const skillCategories = [
  {
    title: "Programming Languages",
    icon: Code2,
    skills: ["Python", "TypeScript", "Java", "Kotlin", "Swift"],
  },
  {
    title: "AI & Machine Learning",
    icon: Brain,
    skills: ["Machine Learning", "Deep Learning", "Model Deployment", "Data Engineering", "IoT + ML Systems"],
  },
  {
    title: "Software & Tools",
    icon: Smartphone,
    skills: ["Flutter", "Node.js", "React", "WebContainers", "Git"],
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    skills: ["Docker", "AWS", "GCP", "CI/CD", "Microservices"],
  },
  {
    title: "Database",
    icon: Database,
    skills: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  },
  {
    title: "Other Skills",
    icon: GitBranch,
    skills: ["Technical Writing", "Project Management", "Agile/Scrum", "Research"],
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
