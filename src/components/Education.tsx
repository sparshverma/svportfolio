import { GraduationCap, MapPin } from "lucide-react";

const education = [
  {
    degree: "MSc Artificial Intelligence",
    institution: "Queen Mary University of London",
    location: "London, United Kingdom",
    period: "2023 - 2024",
    description: "Specialized in machine learning, deep learning, and AI systems. Conducted research in AI-powered cybersecurity.",
  },
  {
    degree: "B.Tech Computer Science Engineering",
    institution: "VIT Vellore",
    location: "Vellore, India",
    period: "2018 - 2022",
    description: "Foundation in computer science fundamentals, algorithms, and software engineering principles.",
  },
];

export const Education = () => {
  return (
    <section id="education" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Education</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {education.map((edu, index) => (
            <div
              key={edu.degree}
              className="glass-card glow-hover rounded-2xl p-8 space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{edu.degree}</h3>
                <p className="text-xl text-primary font-medium">{edu.institution}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {edu.location}
                  </div>
                  <span className="px-3 py-1 bg-muted/50 rounded-full">
                    {edu.period}
                  </span>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
