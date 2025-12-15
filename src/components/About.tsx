import { Brain, Shield, Code, Sparkles } from "lucide-react";

export const About = () => {
  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-primary text-sm font-medium tracking-widest uppercase mb-4 block">
            Get to know me
          </span>
          <h2 className="text-4xl md:text-6xl font-bold">
            About <span className="gradient-text">Me</span>
          </h2>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main intro card - spans 2 columns */}
          <div className="md:col-span-2 glass-card glow-hover rounded-2xl p-8 group animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Who I Am</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm an AI Engineer who genuinely enjoys working on things that matter—turning complex ideas into systems that actually help people. I focus on AI, cybersecurity, and full-stack development because I believe technology should be practical, honest, and built with real intent. I try to approach my work collaboratively and stay grounded, rather than getting caught up in titles or hype.
            </p>
          </div>

          {/* Stats card */}
          <div className="glass-card glow-hover rounded-2xl p-8 flex flex-col justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-6">
              <div className="group cursor-default">
                <div className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform inline-block">2+</div>
                <div className="text-muted-foreground text-sm uppercase tracking-wide mt-1">Years Experience</div>
              </div>
              <div className="group cursor-default">
                <div className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform inline-block">10+</div>
                <div className="text-muted-foreground text-sm uppercase tracking-wide mt-1">Projects Built</div>
              </div>
              <div className="group cursor-default">
                <div className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform inline-block">5+</div>
                <div className="text-muted-foreground text-sm uppercase tracking-wide mt-1">Tech Mastered</div>
              </div>
            </div>
          </div>

          {/* Focus areas - 3 small cards */}
          <div className="glass-card glow-hover rounded-2xl p-6 group animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">AI & ML</h4>
            <p className="text-sm text-muted-foreground">Building intelligent systems that solve real problems</p>
          </div>

          <div className="glass-card glow-hover rounded-2xl p-6 group animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <div className="p-3 rounded-xl bg-secondary/20 text-secondary w-fit mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Cybersecurity</h4>
            <p className="text-sm text-muted-foreground">Protecting systems and exploring AI security intersection</p>
          </div>

          <div className="glass-card glow-hover rounded-2xl p-6 group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Full-Stack</h4>
            <p className="text-sm text-muted-foreground">End-to-end development with modern technologies</p>
          </div>

          {/* Interests card - spans 2 columns */}
          <div className="md:col-span-2 glass-card glow-hover rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <h3 className="text-xl font-semibold text-foreground mb-4">Beyond Engineering</h3>
            <p className="text-muted-foreground leading-relaxed">
              Beyond day-to-day engineering, I'm curious about how AI intersects with security and communication. I've explored this through projects like Cyber.ai and by experimenting with AI journalism, which has taught me to think about how technology really impacts people. I'm also interested in sovereign blockchain design—the idea of building systems that are transparent and built to last.
            </p>
          </div>

          {/* Philosophy card */}
          <div className="glass-card glow-hover rounded-2xl p-8 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <div className="absolute -bottom-4 -right-4 text-8xl font-bold text-primary/5 select-none">✦</div>
            <h3 className="text-xl font-semibold text-foreground mb-4">My Philosophy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
              Staying curious, adding real value, being honest, working well with others, and treating people with respect.
            </p>
          </div>
        </div>

        {/* Certifications banner */}
        <div className="mt-8 glass-card rounded-2xl p-6 md:p-8 animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="shrink-0">
              <span className="text-xs uppercase tracking-widest text-primary font-medium">Credentials</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Kubernetes Certified', 'Goldman Sachs Program', 'Accenture Program', 'AI Journalism Proficiency'].map((cert, i) => (
                <span 
                  key={cert}
                  className="px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground border border-border/50 hover:border-primary/50 hover:text-foreground transition-colors cursor-default"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
