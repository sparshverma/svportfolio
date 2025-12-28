import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load Three.js component to reduce main-thread work
const MobiusStrip = lazy(() => import("./MobiusStrip").then(m => ({ default: m.MobiusStrip })));

export const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Minimal geometric accent */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-glow-pulse" style={{
      animationDelay: '1s'
    }} />
      
      {/* 3D Möbius Strip - Lazy loaded */}
      <Suspense fallback={<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-50 pointer-events-none z-0" />}>
        <MobiusStrip />
      </Suspense>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-12 animate-fade-in">
          {/* Main content */}
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                AI Engineer • Data Analyst • Mobile Developer
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                Sparsh Verma
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Building intelligent systems that merge AI, security, and real-world impact
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg">
              View Projects
            </Button>
            <Button variant="glass" size="lg" asChild>
              <a href="/Sparsh_Verma_CV.pdf" download>
                Download CV
              </a>
            </Button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4">
            <a href="https://github.com/sparshverma" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/sparsh-verma-7773571a1/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:sparsh@example.com" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Minimal scroll indicator */}
      <a href="#about" className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce">
        <ArrowDown className="w-5 h-5" />
      </a>
    </section>;
};