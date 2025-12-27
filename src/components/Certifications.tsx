import { Award, ExternalLink } from "lucide-react";

const certifications = [
  {
    title: "Data Science in Real-world Projects",
    issuer: "Professional Development",
  },
  {
    title: "Google Data Analyst Certificate",
    issuer: "Google",
  },
  {
    title: "Google Business Intelligence Certificate",
    issuer: "Google",
  },
  {
    title: "Software Developer Mastery, Antipatterns",
    issuer: "Software Engineering",
  },
  {
    title: "Goldman Sachs Software Engineering Job Simulation",
    issuer: "Goldman Sachs",
  },
  {
    title: "Project Management Certification",
    issuer: "Professional Development",
  },
  {
    title: "Accenture Data Analytics and Visualisation",
    issuer: "Accenture",
  },
  {
    title: "Kubernetes Certified Application Developer",
    issuer: "Cloud Native Computing Foundation",
  },
  {
    title: "Generative AI Bootcamp",
    issuer: "AI Training",
  },
  {
    title: "JPMorgan Chase & Co. Quantitative Research",
    issuer: "JPMorgan Chase & Co.",
  },
  {
    title: "Tata GenAI Powered Data Analytics",
    issuer: "Tata",
  },
];

export const Certifications = () => {
  return (
    <section id="certifications" className="py-20 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Certifications</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold text-foreground leading-tight">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
