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
    <section id="certifications" className="py-20 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Certifications</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert, index) => {
            const content = (
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {cert.title}
                    </h3>
                    {cert.link && (
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
              </div>
            );

            return cert.link ? (
              <a
                key={index}
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {content}
              </a>
            ) : (
              <div
                key={index}
                className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
