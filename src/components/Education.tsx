import { MapPin, School, GraduationCap, Calendar } from "lucide-react";
import { useState } from "react";
import qmulLogo from "@/assets/logos/qmul.png";
import vitLogo from "@/assets/logos/vit.webp";

const education = [
  {
    degree: "MSc Artificial Intelligence",
    institution: "Queen Mary University of London",
    location: "London, United Kingdom",
    period: "2022 - 2023",
    level: "Postgraduate",
    description:
      "Specialized in machine learning, deep learning, and AI systems. Conducted research in AI-powered cybersecurity.",
    logo: qmulLogo,
    logoAlt: "Queen Mary University of London logo",
  },
  {
    degree: "B.Tech Computer Science Engineering",
    institution: "VIT",
    location: "India",
    period: "2018 - 2022",
    level: "Undergraduate",
    description:
      "Foundation in computer science fundamentals, algorithms, and software engineering principles.",
    logo: vitLogo,
    logoAlt: "VIT logo",
  },
];

const EducationLogo = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className: string;
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
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-12 text-center">
          <span className="gradient-text">Education</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {education.map((edu, index) => (
            <article
              key={edu.degree}
              className="group relative glass-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-500 ease-out animate-fade-in hover:-translate-y-1"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Ambient hover glow */}
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "var(--gradient-glow)" }}
                aria-hidden="true"
              />

              {/* Logo banner */}
              <div className="relative flex items-center justify-center px-6 py-8 sm:py-10 overflow-hidden bg-slate-900 dark:bg-gradient-to-br dark:from-primary/10 dark:via-transparent dark:to-secondary/10">
                {/* Animated scanning shimmer */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 30%, hsl(var(--primary) / 0.18) 50%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />
                {/* Corner glows */}
                <div
                  className="pointer-events-none absolute -top-16 -left-16 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
                  style={{ background: "hsl(var(--primary) / 0.35)" }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ background: "hsl(var(--secondary) / 0.35)" }}
                  aria-hidden="true"
                />

                <EducationLogo
                  src={edu.logo}
                  alt={edu.logoAlt}
                  className="relative z-10 w-full h-auto max-h-40 sm:max-h-48 object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />

                {/* Level pill */}
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-background/60 backdrop-blur-md border border-border/60 text-primary">
                  <GraduationCap className="w-3 h-3" aria-hidden="true" />
                  {edu.level}
                </span>
              </div>

              {/* Content */}
              <div className="relative p-6 sm:p-8 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {edu.degree}
                  </h3>
                  <p className="text-base sm:text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {edu.institution}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground pt-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/50 rounded-full">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {edu.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/50 rounded-full">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {edu.period}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {edu.description}
                </p>

                {/* Underline accent that draws on hover */}
                <div className="pt-2">
                  <div className="h-px w-12 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out group-hover:w-full opacity-60 group-hover:opacity-100" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
