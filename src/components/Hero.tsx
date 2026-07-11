import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";

// Lazy load Three.js component to reduce main-thread work
const MobiusStrip = lazy(() => import("./MobiusStrip").then(m => ({ default: m.MobiusStrip })));

export const Hero = () => {
  const [showMobius, setShowMobius] = useState(false);

  useEffect(() => {
    // Defer Three.js until after the hero has painted to protect LCP
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const trigger = () => setShowMobius(true);
    if (idle) {
      const id = idle(trigger, { timeout: 2000 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(trigger, 800);
    return () => window.clearTimeout(t);
  }, []);

  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Minimal geometric accent */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-glow-pulse" style={{
      animationDelay: '1s'
    }} />
      
      {/* 3D Möbius Strip - Deferred until after LCP */}
      {showMobius && (
        <Suspense fallback={null}>
          <MobiusStrip />
        </Suspense>
      )}
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="space-y-10 sm:space-y-12">
          {/* Main content */}
          <div className="space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-medium opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.1s' }}>
                AI Engineer and Founder
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.3s' }}>
                Sparsh Verma <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-muted-foreground mt-3 sm:mt-4">AI Engineer & Founder</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-hero-fade-in px-2" style={{ animationDelay: '0.5s' }}>
              Building intelligent systems that merge AI, security, and real-world impact
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.7s' }}>
            <Button variant="glass" size="lg" className="gap-2 px-8 sm:px-10 py-5 sm:py-6 text-sm sm:text-base group" asChild>
              <a href="/Sparsh_Verma_CV.pdf" download className="flex items-center gap-2">
                Download CV
                <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>
            </Button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4 opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.9s' }}>
            <a href="https://github.com/sparshverma" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/sparsh-verma-7773571a1/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:sparshv48@gmail.com" aria-label="Email Sparsh" className="p-3 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Minimal scroll indicator */}
      <a href="#about" aria-label="Scroll to About section" className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce">
        <ArrowDown className="w-5 h-5" />
      </a>
    </section>;
};