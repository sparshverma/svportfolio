import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import cyberAi from "@/assets/cyber-ai.jpg";
import projectAi from "@/assets/project-ai.jpg";
import projectMobile from "@/assets/project-mobile.jpg";

const projects = [
  {
    title: "Cyber.ai",
    description: "Research project combining AI with cybersecurity, exploring intelligent threat detection and automated security systems.",
    image: cyberAi,
    tags: ["Python", "Machine Learning", "Cybersecurity", "Research"],
    links: {
      github: "#",
      live: "#",
    },
  },
  {
    title: "AI + IoT System",
    description: "Intelligent IoT system for the poultry industry, leveraging machine learning for efficiency optimization and real-time monitoring.",
    image: projectAi,
    tags: ["IoT", "ML", "Python", "Data Engineering"],
    links: {
      github: "#",
      live: "#",
    },
  },
  {
    title: "Flutter Mobile Suite",
    description: "Collection of cross-platform mobile applications built with Flutter, featuring modern UI/UX and seamless performance.",
    image: projectMobile,
    tags: ["Flutter", "Kotlin", "Swift", "Mobile"],
    links: {
      github: "#",
      live: "#",
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Github className="w-4 h-4" />
                    Code
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Live
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
