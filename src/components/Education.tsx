import { MapPin, School } from "lucide-react";
import { useState } from "react";
import qmulLogo from "@/assets/logos/qmul.png";
import vitLogo from "@/assets/logos/vit.webp";

const education = [
  {
    degree: "MSc Artificial Intelligence",
    institution: "Queen Mary University of London",
    location: "London, United Kingdom",
    period: "2022 - 2023",
    description: "Specialized in machine learning, deep learning, and AI systems. Conducted research in AI-powered cybersecurity.",
    logo: qmulLogo,
    logoAlt: "Queen Mary University of London logo",
  },
  {
    degree: "B.Tech Computer Science Engineering",
    institution: "VIT",
    location: "India",
    period: "2018 - 2022",
    description: "Foundation in computer science fundamentals, algorithms, and software engineering principles.",
    logo: vitLogo,
    logoAlt: "VIT logo",
  },
];

const EducationLogo = ({
  src,
  alt,
  className = "w-16 h-16 sm:w-20 sm:h-20 object-contain",
}: {
  src?: string;
  alt: string;
  className?: string;
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <School className={`${className} text-primary`} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
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
              className="glass-card glow-hover rounded-2xl overflow-hidden flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-center p-4 sm:p-5 bg-primary/10 h-32 sm:h-36">
                <EducationLogo
                  src={edu.logo}
                  alt={edu.logoAlt}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4 flex-1">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
