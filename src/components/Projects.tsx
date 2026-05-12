import { ExternalLink, Github } from "lucide-react";
import cyberAi from "@/assets/cyber-ai.jpg";
import projectRwaChain from "@/assets/project-rwachain.png";
import projectRedI from "@/assets/project-redi.png";
import projectZitboard from "@/assets/project-zitboard.png";

const projects = [
  {
    title: "Cyber.ai",
    description:
      "Research project combining AI with cybersecurity, exploring intelligent threat detection and automated security systems.",
    image: cyberAi,
    tags: ["Python", "Machine Learning", "Cybersecurity", "Research"],
    links: {
      github: "https://github.com/sparshverma/Cyber.AI",
      live: "#",
    },
  },
  {
    title: "RWA-Chain",
    description:
      "Sovereign Layer 1 Blockchain for Real-World Assets. Empowering RWAs, Identity, and DePIN with transparent infrastructure protocol.",
    image: projectRwaChain,
    tags: ["Blockchain", "Layer 1", "DePIN", "Web3"],
    links: {
      github: "https://github.com/sparshverma/rwa-chain",
      live: "#",
    },
  },
  {
    title: "ZitBoard",
    description:
      "AI-powered revenue and hiring command center for sales analytics, forecasting, lead scoring, recruiting insights, and unified CRM.",
    image: projectZitboard,
    tags: ["SaaS", "AI", "Analytics", "CRM"],
    links: {
      live: "https://zitboard.dev",
    },
  },
  {
    title: "RedI - Intelligent Eye",
    description:
      "RedI is a comprehensive visual AI web application that leverages cutting-edge on-device machine learning to provide real-time visual intelligence capabilities. Built with privacy as the foundation, all AI processing happens directly on your device.",
    image: projectRedI,
    tags: ["Visual AI", "Machine Learning", "Privacy", "Web App"],
    links: {
      github: "https://github.com/sparshverma",
      live: "https://red-i.tech",
    },
  },
];

export const Projects = () => {
  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          Featured <span className="gradient-text">Projects</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Hover a tile to reveal the full picture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => {
            const wordCount = project.description.trim().split(/\s+/).length;
            const charCount = project.description.length;
            return (
              <article
                key={project.title}
                className="group relative glass-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-500 ease-out animate-fade-in h-72 hover:shadow-glow"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* Two-column reveal layout */}
                <div className="grid grid-cols-[0fr_1fr] group-hover:grid-cols-[1fr_1fr] transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] h-full">
                  {/* Image side - expands on hover */}
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Description side */}
                  <div className="relative p-6 md:p-7 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-2xl font-bold tracking-tight">
                          {project.title}
                        </h3>
                        <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                          {wordCount}w · {charCount}c
                        </span>
                      </div>
                      <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500 delay-150">
                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source code`}
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.links.live && project.links.live !== "#" && (
                          <a
                            href={project.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live site`}
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
