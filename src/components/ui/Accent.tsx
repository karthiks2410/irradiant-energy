import type { ReactNode } from "react";

/**
 * Green trailing phrase in display/H2 headlines (the brand's two-tone headline).
 * Display sizes only: green-600 on canvas/white and green-500 on teal pass large-text AA, nothing smaller does.
 */
export function Accent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-green-600 in-data-[surface=dark]:text-green-500 ${className}`}>{children}</span>;
}
