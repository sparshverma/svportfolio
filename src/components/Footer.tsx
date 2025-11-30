export const Footer = () => {
  return (
    <footer className="relative py-8 px-6 border-t border-primary/20">
      {/* Neon accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Sparsh Verma
          </p>
          
          <p className="text-muted-foreground text-sm italic">
            Designed with minimalism and intention
          </p>
        </div>
      </div>
    </footer>
  );
};
