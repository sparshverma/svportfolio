import { Briefcase, Calendar } from "lucide-react";

const experiences = [
  {
    title: "Founder and Lead Software Engineer",
    organization: "ZitBoard",
    period: "02/2026 - Present",
    description: "Product & Scale: Conceived, architected, and shipped a full-stack SaaS platform from zero to production, now serving 100+ active users with no co-founder, no agency, no shortcuts. Frontend Engineering: Built a high-performance marketing site and user dashboard in vanilla HTML, CSS, and JavaScript — no bloated frameworks, just fast, accessible, and clean interfaces that load instantly. Backend & Infrastructure: Designed and deployed the entire backend from scratch using Node.js and Supabase (PostgreSQL), provisioning cloud infrastructure on Vercel for Frontend and Azure for Backend services with Bicep templates and Docker for reproducible, scalable deployments. Quality & Reliability: Engineered end-to-end test pipelines with Playwright and custom Python automation scripts, integrating them directly into CI/CD — cutting production regressions significantly and shipping with confidence. Growth & Analytics: Wired up window.dataLayer event tracking and automated SEO validation pipelines to monitor the full user onboarding funnel and surface conversion drop-offs before they cost growth.",
    type: "Founder",
  },
  {
    title: "Data Analyst(Administrator)",
    organization: "Fullers Smith and Turner",
    period: "03/2024 - 11/2025",
    description: "ML & Automation: Built and maintained Python-based machine learning models that automatically processed and scored 20,000+ daily transactions, helping operations teams make faster, more consistent decisions across 127 business units. ETL Pipelines: Designed and owned end-to-end ETL pipelines that moved, cleaned, and structured roughly 4TB of data every month across 127 business units, built on Apache Spark with same-day refresh cycles so models were never running on stale data. Anomaly Detection: Ran regular analysis across millions of transaction records to flag unusual patterns and outliers, surfacing findings that helped the business avoid roughly $10,000+ in losses each quarter. Dashboards & Reporting: Built and maintained live KPI dashboards in Power BI that gave leadership a clear, up-to-date view of business performance, replacing manual reporting and saving significant time each week. Cross-team Collaboration: Worked closely with product, engineering, and business teams to understand their data needs, translate them into analytical solutions, and deliver working models and reports on a roughly two-week turnaround.",
    type: "Data",
  },
  {
    title: "AI Research",
    organization: "Queen Mary University of London",
    period: "2023 - 2024",
    description: "Conducted research in AI and cybersecurity, culminating in the publication of 'Cyber.ai'. Focused on intelligent threat detection and automated security systems.",
    type: "Academic",
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
    <section id="experience" className="py-16 sm:py-20 px-5 sm:px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 text-center">
          <span className="gradient-text">Experience</span>
        </h2>
        
        <div className="relative">
          {/* Curved SVG Timeline */}
          <svg
            className="absolute left-[18px] md:left-8 top-0 h-full w-12 pointer-events-none"
            viewBox="0 0 48 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M 8 0 
                 C 8 5, 8 7, 24 12.5 
                 C 40 18, 40 20, 24 25 
                 C 8 30, 8 32, 24 37.5 
                 C 40 43, 40 45, 24 50 
                 C 8 55, 8 57, 24 62.5 
                 C 40 68, 40 70, 24 75 
                 C 8 80, 8 82, 8 100"
              stroke="url(#timelineGradient)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className="relative pl-12 sm:pl-16 md:pl-24 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot with glow */}
                <div className="absolute left-[10px] sm:left-[14px] md:left-[30px] top-8 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-shadow duration-500 z-10" />
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden">
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300">{exp.title}</h3>
                        <p className="text-primary/80 font-medium mt-1 text-sm sm:text-base">{exp.organization}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium border border-primary/20 whitespace-nowrap">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {exp.period}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {exp.description}
                    </p>
                    
                    {/* Type badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs font-medium">
                        <Briefcase className="w-3 h-3" />
                        {exp.type}
                      </span>
                    </div>
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
