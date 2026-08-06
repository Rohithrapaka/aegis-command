import { Link } from "@tanstack/react-router";
import { Wordmark } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-14 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <Wordmark sub="ADAPTIVE BIOMETRIC PROTECTION" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Identity infrastructure for organisations that treat trust as a product surface, not a
            checkbox.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <Link to="/command" className="transition-colors duration-500 hover:text-foreground">
            Command Center
          </Link>
          <span>SOC 2 Type II</span>
          <span>ISO/IEC 30107-3</span>
          <span className="font-mono text-xs">© {new Date().getFullYear()} AEGISAUTH</span>
        </div>
      </div>
    </footer>
  );
}