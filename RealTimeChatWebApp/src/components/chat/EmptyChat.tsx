import { MessageCircle } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex h-full flex-1 items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <MessageCircle size={27} className="text-cyan-400" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          Your conversations, all in one place.
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Select an existing conversation or search for someone to start a new
          one.
        </p>
      </div>
    </div>
  );
}
