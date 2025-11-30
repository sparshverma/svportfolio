import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters")
});
export const Contact = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      contactSchema.parse(formData);
      setIsSubmitting(true);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_key: "99e6f79e-5928-4651-aff5-00015b73fdd6",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: "New Contact Form Submission - Sparsh Verma Portfolio"
        })
      });
      if (response.ok) {
        toast({
          title: "Message sent!",
          description: "Thank you for reaching out. I'll get back to you soon."
        });

        // Clear form
        setFormData({
          name: "",
          email: "",
          message: ""
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="contact" className="py-20 px-6">
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
              <a href="mailto:sparsh@example.com" className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group">
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">sparshv48@gmail.com</div>
                </div>
              </a>
              
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group">
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-muted-foreground">github.com/sparshverma</div>
                </div>
              </a>
              
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground/90 hover:text-primary transition-colors group">
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
          <form onSubmit={handleSubmit} className="glass-card glow-hover rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Your name" className="bg-muted/50 border-border/50" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your.email@example.com" className="bg-muted/50 border-border/50" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Your message..." className="bg-muted/50 border-border/50 min-h-32 resize-none" value={formData.message} onChange={e => setFormData({
              ...formData,
              message: e.target.value
            })} required />
            </div>
            
            <Button variant="hero" className="w-full gap-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>;
};