import { Briefcase } from "lucide-react";

const experiences = [
  {
    title: "AI Research",
    organization: "Queen Mary University of London",
    period: "2023 - 2024",
    description: "Conducted research in AI and cybersecurity, culminating in the publication of 'Cyber.ai'. Focused on intelligent threat detection and automated security systems.",
    type: "Academic",
  },
  {
    title: "Data Administrator",
    organization: "Fullers Smith and Turner",
    period: "03/2024 - 11/2025",
    description: "Maintained 99.5% data integrity across multiple databases serving critical business operations. Troubleshoot database issues and resolve problems promptly. Created interactive Power BI dashboards serving 200+ stakeholders, improving decision-making efficiency by 25%. Implemented ETL pipelines using Hadoop, Spark, and Kafka, reducing data processing time by 35%. Ensuring all employment regulations are followed, including working hours, payroll, health and safety.",
    type: "Data",
  },
  {
    title: "Brand Ambassador",
    organization: "Meraki (London)",
    period: "01/2024 - 02/2024",
    description: "Served as the charismatic front-line brand ambassador (Sales) of HelloFresh-branded food items. Achieved targeted sales campaign for Hello Fresh at Meraki, resulting in a remarkable 25% increase in sales revenue within the first month. Achieved personal best (PB) sales record with 18 sales in a day and 41 sales in a week. Elevated customer satisfaction through personalised product recommendations, contributing to a 25% increase in repeat purchases and a substantial 30% surge in overall revenue.",
    type: "Sales",
  },
  {
    title: "Android App Developer",
    organization: "DeepStory (India)",
    period: "06/2022 - 09/2022",
    description: "Developed cutting-edge social media applications at DeepStory, a startup focusing on REST API development and AWS database management. Played a pivotal role as a front-end developer and MLOps specialist, utilising Android Studio for front-end development and PyCharm for MLOps. Optimised reinforcement learning algorithms, achieving 20% accuracy improvement on recommendation systems.",
    type: "Development",
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Experience</span>
        </h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-primary opacity-30" />
          
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className="relative pl-20 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary shadow-glow" />
                
                <div className="glass-card glow-hover rounded-2xl p-6 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-2xl font-bold">{exp.title}</h3>
                      <p className="text-primary font-medium">{exp.organization}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {exp.period}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    {exp.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
