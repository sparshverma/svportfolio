import { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

// Lazy load below-the-fold components
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const Skills = lazy(() => import("@/components/Skills").then(m => ({ default: m.Skills })));
const Projects = lazy(() => import("@/components/Projects").then(m => ({ default: m.Projects })));
const Experience = lazy(() => import("@/components/Experience").then(m => ({ default: m.Experience })));
const Education = lazy(() => import("@/components/Education").then(m => ({ default: m.Education })));
const Certifications = lazy(() => import("@/components/Certifications").then(m => ({ default: m.Certifications })));
const Contact = lazy(() => import("@/components/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Suspense fallback={<div className="min-h-screen" />}>
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Certifications />
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
