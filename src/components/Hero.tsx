import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background orb */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <img 
          src={heroOrb} 
          alt="" 
          className="w-full max-w-3xl animate-float"
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              Sparsh Verma
            </h1>
            <div className="flex flex-wrap justify-center gap-3 text-lg md:text-xl text-muted-foreground">
              <span className="gradient-text font-semibold">AI Engineer</span>
              <span>•</span>
              <span className="gradient-text font-semibold">Full-Stack Developer</span>
              <span>•</span>
              <span className="gradient-text font-semibold">Mobile Developer</span>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Building intelligent systems that merge AI, security, and real-world impact
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            B.Tech in Computer Science (VIT, India) • MSc in Artificial Intelligence (Queen Mary University of London)
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button variant="hero" size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download CV
            </Button>
            <Button variant="glass" size="lg" className="gap-2">
              <ExternalLink className="w-5 h-5" />
              View Projects
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-glow-pulse" />
        </div>
      </div>
    </section>
  );
};
