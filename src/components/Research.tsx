import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import cyberAi from "@/assets/cyber-ai.webp";

export const Research = () => {
  return (
    <section id="research" className="py-16 sm:py-20 px-5 sm:px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-12 text-center">
          <span className="gradient-text">Research</span>
        </h2>
        
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <img
                src={cyberAi}
                alt="Cyber.ai Research"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
            </div>
            
            <div className="p-6 sm:p-8 md:p-12 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-bold">Cyber.ai</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">AI × Cybersecurity Integration</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                  A comprehensive research paper exploring the intersection of artificial intelligence 
                  and cybersecurity. This work investigates how machine learning algorithms can enhance 
                  threat detection, automate security responses, and predict potential vulnerabilities.
                </p>
                
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  The research covers real-world applications, implementation challenges, and future 
                  directions for AI-powered security systems in enterprise environments.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2 sm:pt-4">
                <Button variant="glass" className="gap-2" asChild>
                  <a 
                    href="/Cyber_AI_Research_Paper.pdf" 
                    download="Cyber_AI_Research_Paper.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4" />
                    Download Paper
                  </a>
                </Button>
                <Button variant="outline" className="gap-2">
                  Read Abstract
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
