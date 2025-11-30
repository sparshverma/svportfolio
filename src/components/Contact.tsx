import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, Send } from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Get In <span className="gradient-text">Touch</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
              <p className="text-muted-foreground leading-relaxed">
                I'm currently available for new opportunities and collaborations. 
                Feel free to reach out if you'd like to discuss AI projects, full-stack development, 
                or potential roles.
              </p>
            </div>
            
            <div className="space-y-4">
              <a
                href="mailto:sparsh@example.com"
                className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group"
              >
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">sparsh@example.com</div>
                </div>
              </a>
              
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group"
              >
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-muted-foreground">github.com/sparshverma</div>
                </div>
              </a>
              
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group"
              >
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">LinkedIn</div>
                  <div className="text-sm text-muted-foreground">linkedin.com/in/sparshverma</div>
                </div>
              </a>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="glass-card glow-hover rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Your name" className="bg-muted/50 border-border/50" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your.email@example.com" className="bg-muted/50 border-border/50" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                placeholder="Your message..." 
                className="bg-muted/50 border-border/50 min-h-32 resize-none" 
              />
            </div>
            
            <Button variant="hero" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
