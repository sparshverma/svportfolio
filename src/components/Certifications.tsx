import { Award, ExternalLink } from "lucide-react";
import { useState } from "react";
import courseraLogo from "@/assets/certification-logos/coursera.svg.asset.json";
import anthropicLogo from "@/assets/certification-logos/anthropic.svg.asset.json";
import growthSchoolLogo from "@/assets/certification-logos/growthschool.png.asset.json";
import forageLogo from "@/assets/certification-logos/forage.png.asset.json";
import dubaiFutureLogo from "@/assets/certification-logos/dubai.png.asset.json";
import lovableLogo from "@/assets/certification-logos/lovable.ico.asset.json";
import udemyLogo from "@/assets/certification-logos/udemy.svg.asset.json";
import jpmorganLogo from "@/assets/certification-logos/jpmorgan.png.asset.json";
import goldmanSachsLogo from "@/assets/certification-logos/goldmansachs.svg.asset.json";
import googleLogo from "@/assets/certification-logos/google.svg.asset.json";
import accentureLogo from "@/assets/certification-logos/accenture.svg.asset.json";
import hackerRankLogo from "@/assets/certification-logos/hackerrank.svg.asset.json";
import tataLogo from "@/assets/certification-logos/tata.svg.asset.json";

// The site's asset host also serves logos in local previews, where relative asset URLs fall through to HTML.
const assetUrl = (url: string) => `https://svportfolio.lovable.app${url}`;

const issuerLogos: Record<string, { url: string; monochrome?: boolean }> = {
  Coursera: { url: courseraLogo.url, monochrome: true },
  Anthropic: { url: anthropicLogo.url, monochrome: true },
  GrowthSchool: { url: growthSchoolLogo.url },
  Forage: { url: forageLogo.url },
  "Dubai Future Foundation": { url: dubaiFutureLogo.url },
  Lovable: { url: lovableLogo.url },
  Udemy: { url: udemyLogo.url, monochrome: true },
  "JPMorgan Chase & Co.": { url: jpmorganLogo.url },
  "Goldman Sachs": { url: goldmanSachsLogo.url, monochrome: true },
  Google: { url: googleLogo.url, monochrome: true },
  Accenture: { url: accentureLogo.url, monochrome: true },
  HackerRank: { url: hackerRankLogo.url, monochrome: true },
  Tata: { url: tataLogo.url, monochrome: true },
};

const IssuerLogo = ({ issuer }: { issuer: string }) => {
  const [failed, setFailed] = useState(false);
  const logo = issuerLogos[issuer];

  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card p-2.5 transition-colors duration-300 group-hover:border-primary/30">
      {logo && !failed ? (
        <img
          src={assetUrl(logo.url)}
          alt={`${issuer} logo`}
          loading="lazy"
          className={`h-full w-full object-contain ${logo.monochrome ? "dark:invert" : ""}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <Award className="h-5 w-5 text-primary" aria-label={`${issuer} emblem`} />
      )}
    </span>
  );
};

const certifications = [
  {
    title: "Google AI Professional (Coursera)",
    issuer: "Coursera",
    link: "https://www.coursera.org/account/accomplishments/professional-cert/4PODSM90T4LI",
  },
  {
    title: "Claude 101 – Anthropic",
    issuer: "Anthropic",
    link: "https://verify.skilljar.com/c/2wmpy9nqnmyd",
  },
  {
    title: "AI Fluency Framework & Foundations – Anthropic",
    issuer: "Anthropic",
    link: "https://verify.skilljar.com/c/eozf7gas4hb7",
  },
  {
    title: "Generative AI Bootcamp",
    issuer: "GrowthSchool",
    link: "https://learners.growthschool.io/certificate/f9409f43-5fab-4e47-a339-c1875de2c887",
  },
  {
    title: "Automation AI Accelerator: Co-pilot to Autonomous Agent",
    issuer: "Forage",
    link: "https://www.theforage.com/completion-certificates/gCW7Xki5Y3vNpBmnn/Nw3MzxF2wjmki7Qor_gCW7Xki5Y3vNpBmnn_tgNmebyHmYscuxY4r_1773077581406_completion_certificate.pdf",
  },
  {
    title: "The One Million Prompters – Dubai Future Foundation",
    issuer: "Dubai Future Foundation",
    link: "https://omp.dub.ai/certificate/Gl1U2jHpyxDb",
  },
  {
    title: "Vibe Coding L2: Silver (Lovable)",
    issuer: "Lovable",
  },
  {
    title: "Kubernetes Certified App Developer",
    issuer: "Udemy",
    link: "https://www.udemy.com/certificate/UC-c8427c3e-5910-44df-a63d-034f9bc9ca31/",
  },
  {
    title: "JPMorgan Chase Quantitative Research",
    issuer: "JPMorgan Chase & Co.",
    link: "https://www.theforage.com/completion-certificates/Sj7temL583QAYpHXD/bWqaecPDbYAwSDqJy_Sj7temL583QAYpHXD_tgNmebyHmYscuxY4r_1766847181750_completion_certificate.pdf",
  },
  {
    title: "Goldman Sachs SE Job Simulation",
    issuer: "Goldman Sachs",
    link: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/Goldman%20Sachs/NPdeQ43o8P9HJmJzg_Goldman%20Sachs_tgNmebyHmYscuxY4r_1725560948162_completion_certificate.pdf",
  },
  {
    title: "Data Science in Real-world Projects",
    issuer: "Udemy",
    link: "https://www.udemy.com/certificate/UC-2783f98c-b93c-4dc9-af37-7a46f9b43cab/",
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
    title: "Accenture Data Analytics & Visualisation",
    issuer: "Accenture",
    link: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/Accenture%20North%20America/hzmoNKtzvAzXsEqx8_Accenture%20North%20America_tgNmebyHmYscuxY4r_1726161271344_completion_certificate.pdf",
  },
  {
    title: "Software Engineer Certificate - HackerRank",
    issuer: "HackerRank",
    link: "https://www.hackerrank.com/certificates/iframe/8d37233d3769",
  },
  {
    title: "SQL(Advanced) Certification - HackerRank",
    issuer: "HackerRank",
    link: "https://www.hackerrank.com/certificates/iframe/61b34efbeb35",
  },
  {
    title: "Tata - GenAI Powered Data Analytics",
    issuer: "Tata",
    link: "https://www.theforage.com/completion-certificates/ifobHAoMjQs9s6bKS/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_tgNmebyHmYscuxY4r_1766861534585_completion_certificate.pdf",
  },
  {
    title: "Software Development Mastery: Antipatterns",
    issuer: "Udemy",
    link: "https://www.udemy.com/certificate/UC-c7e89f6e-26ec-4792-944f-cdf50e5fdeb3/",
  },
];

export const Certifications = () => {
  return (
    <section id="certifications" className="py-16 sm:py-24 px-5 sm:px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Certifications</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Professional credentials and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {certifications.map((cert, index) => {
            const content = (
              <div className="flex items-start gap-4 relative z-10">
                <IssuerLogo issuer={cert.issuer} />
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
