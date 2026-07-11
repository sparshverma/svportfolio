import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calendar, ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";

export type ExperienceEntry = {
  title: string;
  organization: string;
  period: string;
  type: string;
  summary: string;
  highlights: string[];
  stack?: string[];
};

type Props = {
  entry: ExperienceEntry;
  index: number;
  isExpanded: boolean;
  isFaded: boolean;
  onToggle: () => void;
  onHover: (hovered: boolean) => void;
};

export const ExperienceItem = ({
  entry,
  index,
  isExpanded,
  isFaded,
  onToggle,
  onHover,
}: Props) => {
  const reduce = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-12 sm:pl-16 md:pl-24 group"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        opacity: isFaded ? 0.38 : 1,
        transition: "opacity 400ms ease",
      }}
    >
      {/* Timeline dot */}
      <div
        ref={dotRef}
        className="absolute left-[8px] sm:left-[12px] md:left-[28px] top-7 z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 + 0.2, type: "spring", stiffness: 260, damping: 18 }}
          className="relative w-4 h-4 rounded-full bg-primary shadow-[0_0_24px_hsl(var(--primary)/0.7)]"
        >
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        </motion.div>
      </div>

      {/* Sticky year gutter (md+) */}
      <div className="hidden md:block absolute left-14 top-6 w-10 -translate-x-full pr-2 text-right">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70">
          {entry.period.split(" ")[0]}
        </span>
      </div>

      {/* Card */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl cursor-pointer
          bg-gradient-to-br from-card/70 to-card/30
          transition-all duration-500 ease-out
          ${isExpanded
            ? "border-primary/50 shadow-[0_0_40px_hsl(var(--primary)/0.18)]"
            : "border-border/50 hover:border-primary/30 hover:-translate-y-0.5"}
        `}
      >
        {/* One-shot glow sweep */}
        {!reduce && (
          <motion.div
            initial={{ x: "-120%" }}
            whileInView={{ x: "120%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, delay: index * 0.08 + 0.15, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 -inset-x-1/2 w-1/2 opacity-40"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, hsl(var(--primary) / 0.25) 50%, transparent 70%)",
            }}
          />
        )}

        {/* Header */}
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                {entry.title}
              </h3>
              <p className="text-primary/90 font-medium mt-1 text-sm sm:text-base">
                {entry.organization}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium border border-primary/20 whitespace-nowrap">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {entry.period}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="p-1.5 rounded-full bg-muted/40 border border-border/50"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

          {/* Summary (always visible) */}
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {entry.summary}
          </p>

          {/* Type chip */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/20 text-secondary-foreground/90 rounded-full text-xs font-medium border border-secondary/30">
              <Briefcase className="w-3 h-3" />
              {entry.type}
            </span>
          </div>

          {/* Expanded content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="details"
                initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-border/50 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Highlights
                    </h4>
                    <ul className="space-y-2.5">
                      {entry.highlights.map((h, i) => (
                        <motion.li
                          key={i}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.05, duration: 0.35 }}
                          className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed pl-4 relative"
                        >
                          <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary/70 shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
                          {h}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {entry.stack && entry.stack.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-2.5">
                        Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.stack.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-full text-xs bg-muted/40 border border-border/60 text-foreground/80 hover:border-primary/40 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
