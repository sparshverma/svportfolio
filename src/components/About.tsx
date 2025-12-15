export const About = () => {
  return <section id="about" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          About <span className="gradient-text">Me</span>
        </h2>
        
        <div className="glass-card glow-hover rounded-2xl p-8 md:p-12 space-y-6">
          <p className="text-lg text-foreground/90 leading-relaxed">I'm an AI Engineer who genuinely enjoys working on things that matter—turning complex ideas into systems that actually help people. I focus on AI, cybersecurity, and full-stack development because I believe technology should be practical, honest, and built with real intent. I try to approach my work collaboratively and stay grounded, rather than getting caught up in titles or hype.


        </p>
          
          <p className="text-lg text-foreground/90 leading-relaxed">
            My expertise spans across Python, TypeScript, Java, Kotlin, and Swift, with a particular focus on the 
            intersection of AI and Cybersecurity. I recently published a research paper titled{" "}
            <span className="text-primary font-semibold">"Cyber.ai"</span> exploring this critical domain.
          </p>
          
          <p className="text-lg text-foreground/90 leading-relaxed">
            Beyond technical skills, I'm actively developing my project management capabilities through comprehensive 
            courses (PMP, PRINCE2 certified instructors) to better lead and deliver complex initiatives.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">2+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">10+</div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold gradient-text">5+</div>
              <div className="text-muted-foreground">Technologies Mastered</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};