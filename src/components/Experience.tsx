import { Briefcase } from "lucide-react";

const experiences = [
  {
    title: "AI Research",
    organization: "Queen Mary University of London",
    period: "2023 - 2024",
    description: "Conducted research in AI and cybersecurity, culminating in the publication of 'Cyber.ai'. Focused on intelligent threat detection and automated security systems.",
    type: "Academic",
  },
  {
    title: "Full-Stack Development",
    organization: "Personal Projects",
    period: "2022 - Present",
    description: "Developed multiple full-stack applications using Python, TypeScript, and Node.js. Implemented modern architectures and deployed to cloud platforms.",
    type: "Development",
  },
  {
    title: "Mobile Development",
    organization: "Freelance",
    period: "2021 - Present",
    description: "Created cross-platform mobile applications using Flutter, with native implementations in Kotlin and Swift for optimal performance.",
    type: "Mobile",
  },
  {
    title: "Project Management Training",
    organization: "Udemy - PMP & PRINCE2",
    period: "2024",
    description: "Actively developing project management skills through comprehensive courses led by certified instructors. Focus on Agile, Scrum, and enterprise project delivery.",
    type: "Learning",
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Experience</span>
        </h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary opacity-30" />
          
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className="relative pl-20 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary shadow-glow" />
                
                <div className="glass-card glow-hover rounded-2xl p-6 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-2xl font-bold">{exp.title}</h3>
                      <p className="text-primary font-medium">{exp.organization}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {exp.period}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    {exp.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
