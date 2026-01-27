import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import cyberAi from "@/assets/cyber-ai.jpg";
import projectMax from "@/assets/project-max.jpg";
import projectRwaChain from "@/assets/project-rwachain.png";
import projectRedI from "@/assets/project-redi.png";

const projects = [
  {
    title: "Cyber.ai",
    description: "Research project combining AI with cybersecurity, exploring intelligent threat detection and automated security systems.",
    image: cyberAi,
    tags: ["Python", "Machine Learning", "Cybersecurity", "Research"],
    links: {
      github: "https://github.com/sparshverma/Cyber.AI",
      live: "#",
    },
  },
  {
    title: "RWA-Chain",
    description: "Sovereign Layer 1 Blockchain for Real-World Assets. Empowering RWAs, Identity, and DePIN with transparent infrastructure protocol.",
    image: projectRwaChain,
    tags: ["Blockchain", "Layer 1", "DePIN", "Web3"],
    links: {
      github: "https://github.com/sparshverma/rwa-chain",
      live: "#",
    },
  },
  {
    title: "Max",
    description: "First AI GPT voice assistant, developed in Python using OpenAI and pyttsx3 libraries, implemented in an Android application using Android Studio.",
    image: projectMax,
    tags: ["Python", "OpenAI", "Android", "Voice AI"],
    links: {
      github: "https://github.com/sparshverma/Max",
      live: "#",
    },
  },
  {
    title: "RedI - Intelligent Eye",
    description: "RedI is a comprehensive visual AI web application that leverages cutting-edge on-device machine learning to provide real-time visual intelligence capabilities. Built with privacy as the foundation, all AI processing happens directly on your device.",
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
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Featured <span className="gradient-text">Projects</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="glass-card glow-hover rounded-2xl overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
              </div>
              
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">{project.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    asChild
                  >
                    <a 
                      href={project.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    asChild
                  >
                    <a 
                      href={project.links.live} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
