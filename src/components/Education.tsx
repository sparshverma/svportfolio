import { MapPin, School } from "lucide-react";
import { useState } from "react";

const education = [
  {
    degree: "MSc Artificial Intelligence",
    institution: "Queen Mary University of London",
    location: "London, United Kingdom",
    period: "2023 - 2024",
    description: "Specialized in machine learning, deep learning, and AI systems. Conducted research in AI-powered cybersecurity.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Queen_Mary_University_of_London_Logo.svg",
    logoAlt: "Queen Mary University of London logo",
  },
  {
    degree: "B.Tech Computer Science Engineering",
    institution: "VIT",
    location: "India",
    period: "2018 - 2022",
    description: "Foundation in computer science fundamentals, algorithms, and software engineering principles.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/VIT_Vellore_Logo.svg",
    logoAlt: "VIT logo",
  },
];

const EducationLogo = ({ src, alt }: { src?: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <School className="w-8 h-8 text-primary" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-8 h-8 object-contain"
      onError={() => setError(true)}
    />
  );
};

export const Education = () => {
  return (
    <section id="education" className="py-16 sm:py-20 px-5 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-12 text-center">
          <span className="gradient-text">Education</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {education.map((edu, index) => (
            <div
              key={edu.degree}
              className="glass-card glow-hover rounded-2xl p-6 sm:p-8 space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <EducationLogo src={edu.logo} alt={edu.logoAlt} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold">{edu.degree}</h3>
                <p className="text-base sm:text-xl text-primary font-medium">{edu.institution}</p>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {edu.location}
                  </div>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-muted/50 rounded-full">
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
