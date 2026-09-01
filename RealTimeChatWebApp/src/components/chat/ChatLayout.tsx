import type { ReactNode } from "react";

interface ChatLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export default function ChatLayout({ sidebar, main }: ChatLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#020617] pt-22 text-white">
      <div className="mx-auto flex h-full max-w-[1600px]">
        <div className="flex min-w-0 flex-1">
          {sidebar}

          <main className="hidden min-w-0 flex-1 lg:flex">{main}</main>
        </div>
      </div>
    </div>
  );
}
