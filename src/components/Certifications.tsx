import { Award, ExternalLink } from "lucide-react";

const certifications = [
  {
    title: "Data Science in Real-world Projects",
    issuer: "Professional Development",
    link: "https://ude.my/UC-2783f98c-b93c-4dc9-af37-7a46f9b43cab",
  },
  {
    title: "Google Data Analyst Certificate",
    issuer: "Google",
    link: "https://www.credly.com/badges/0a75faa0-0aa1-4b92-b085-2e0f0083c610/public_url",
  },
  {
    title: "Google Business Intelligence Certificate",
    issuer: "Google",
    link: "https://www.credly.com/badges/5bb5ea99-fa8f-408f-833f-4a81a0822d09",
  },
  {
    title: "Software Developer Mastery, Antipatterns",
    issuer: "Software Engineering",
    link: "https://ude.my/UC-c7e89f6e-26ec-4792-944f-cdf50e5fdeb3",
  },
  {
    title: "Goldman Sachs Software Engineering Job Simulation",
    issuer: "Goldman Sachs",
    link: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/Goldman%20Sachs/NPdeQ43o8P9HJmJzg_Goldman%20Sachs_tgNmebyHmYscuxY4r_1725560948162_completion_certificate.pdf",
  },
  {
    title: "Project Management Certification",
    issuer: "Professional Development",
  },
  {
    title: "Accenture Data Analytics and Visualisation",
    issuer: "Accenture",
    link: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/Accenture%20North%20America/hzmoNKtzvAzXsEqx8_Accenture%20North%20America_tgNmebyHmYscuxY4r_1726161271344_completion_certificate.pdf",
  },
  {
    title: "Kubernetes Certified Application Developer",
    issuer: "Cloud Native Computing Foundation",
    link: "https://ude.my/UC-c8427c3e-5910-44df-a63d-034f9bc9ca31",
  },
  {
    title: "Generative AI Bootcamp",
    issuer: "AI Training",
    link: "https://learners.growthschool.io/certificate/f9409f43-5fab-4e47-a339-c1875de2c887",
  },
  {
    title: "JPMorgan Chase & Co. Quantitative Research",
    issuer: "JPMorgan Chase & Co.",
    link: "https://www.theforage.com/completion-certificates/Sj7temL583QAYpHXD/bWqaecPDbYAwSDqJy_Sj7temL583QAYpHXD_tgNmebyHmYscuxY4r_1766847181750_completion_certificate.pdf",
  },
  {
    title: "Tata GenAI Powered Data Analytics",
    issuer: "Tata",
    link: "https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_tgNmebyHmYscuxY4r_1766861534585_completion_certificate.pdf",
  },
];

export const Certifications = () => {
  return (
    <section id="certifications" className="py-24 px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Certifications</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Professional credentials and achievements
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert, index) => {
            const content = (
              <div className="flex items-start gap-4 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                      {cert.title}
                    </h3>
                    {cert.link && (
                      <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
              </div>
            );

            const cardClasses = `
              relative rounded-2xl p-5 
              bg-gradient-to-br from-card/80 to-card/40
              backdrop-blur-sm
              border border-border/50
              hover:border-primary/30
              hover:shadow-lg hover:shadow-primary/5
              transition-all duration-500 ease-out
              group
              hover:-translate-y-1
            `;

            return cert.link ? (
              <a
                key={index}
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {content}
              </a>
            ) : (
              <div
                key={index}
                className={cardClasses}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
