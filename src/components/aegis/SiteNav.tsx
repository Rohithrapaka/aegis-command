import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./Brand";

const LINKS = [
  { label: "Technology", href: "#solution" },
  { label: "Architecture", href: "#flow" },
  { label: "Demo", href: "#demo" },
];

export function SiteNav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 160], ["oklch(1 0 0 / 0%)", "oklch(1 0 0 / 62%)"]);
  const borderOpacity = useTransform(scrollY, [0, 160], [0, 1]);

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl"
    >
      <motion.div style={{ opacity: borderOpacity }} className="absolute inset-x-0 bottom-0 h-px bg-border" />
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-12">
        <Link to="/" className="transition-opacity duration-500 hover:opacity-70">
          <Wordmark />
        </Link>
        <div className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="relative transition-colors duration-500 hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-500 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/command"
            className="relative transition-colors duration-500 hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-500 hover:after:w-full"
          >
            Command Center
          </Link>
        </div>
        <Link
          to="/command"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all duration-500 hover:gap-3"
        >
          Admin Login
          <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </motion.header>
  );
}