import type { PropsWithChildren, ReactNode } from "react";

export function SectionCard({ title, eyebrow, action, children, className = "" }: PropsWithChildren<{ title: string; eyebrow?: string; action?: ReactNode; className?: string }>) {
  return (
    <section className={`section-card ${className}`}>
      <header className="section-head">
        <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
        {action}
      </header>
      {children}
    </section>
  );
}
