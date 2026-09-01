import type { ReactNode } from "react";

interface ChatLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  showMainOnMobile?: boolean;
}

export default function ChatLayout({
  sidebar,
  main,
  showMainOnMobile = false,
}: ChatLayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#020617] pt-22 text-white">
      <div className="mx-auto flex h-full max-w-[1600px]">
        <div className="flex min-w-0 flex-1">
          {/* Sidebar */}
          <div
            className={`w-full lg:flex lg:w-auto ${
              showMainOnMobile ? "hidden" : "flex"
            }`}
          >
            {sidebar}
          </div>

          {/* Main conversation */}
          <div
            className={`min-w-0 flex-1 ${
              showMainOnMobile ? "flex" : "hidden lg:flex"
            }`}
          >
            {main}
          </div>
        </div>
      </div>
    </div>
  );
}
