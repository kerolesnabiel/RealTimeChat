import type { ReactNode } from "react";

interface ProfileLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function ProfileLayout({
  sidebar,
  children,
}: ProfileLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside>{sidebar}</aside>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
