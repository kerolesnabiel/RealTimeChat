import {
  ArrowRight,
  Check,
  MessageCircle,
  MoreHorizontal,
  Send,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

export default function Home() {
  return (
    <main className="app-background">
      {/* Additional page-specific glows */}
      <div className="glow-blue -right-37.5 top-[30%]" />
      <div className="glow-purple -bottom-50 -left-37.5" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-36">
        {/* Hero */}
        <section className="grid min-h-[calc(100vh-9rem)] items-center gap-16 lg:grid-cols-2">
          {/* Left content */}
          <div>
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Real-time conversations
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Conversations that
              <span className="block bg-linear-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                move with you.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              A beautifully simple real-time chat experience designed for
              instant conversations, meaningful connections, and staying close
              to the people who matter.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/30"
              >
                Start chatting
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/3 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.07]"
              >
                I already have an account
              </Link>
            </div>

            {/* Features */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Instant messaging
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Online presence
              </div>

              <div className="flex items-center gap-2">
                <Check size={16} className="text-cyan-400" />
                Real-time updates
              </div>
            </div>
          </div>

          {/* Right: Chat Preview */}
          <div className="relative mx-auto w-full max-w-lg">
            {/* Decorative rings */}
            <div className="absolute -inset-5 rounded-4xl border border-cyan-400/10" />
            <div className="absolute -inset-10 rounded-[2.5rem] border border-blue-500/5" />

            {/* Chat Window */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-blue-600 text-sm font-bold">
                      A
                    </div>

                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Alex Morgan</p>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>

                <MoreHorizontal size={20} className="text-slate-500" />
              </div>

              {/* Messages */}
              <div className="space-y-5 p-5">
                {/* Received */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-blue-600 text-xs font-bold">
                    A
                  </div>

                  <div>
                    <div className="rounded-2xl rounded-tl-md bg-white/6 px-4 py-3">
                      <p className="text-sm leading-6 text-slate-200">
                        Hey! Are we still meeting later today?
                      </p>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600">10:42 AM</p>
                  </div>
                </div>

                {/* Sent */}
                <div className="flex justify-end">
                  <div>
                    <div className="rounded-2xl rounded-tr-md bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 shadow-lg shadow-blue-500/10">
                      <p className="text-sm leading-6 text-white">
                        Absolutely! Looking forward to it.
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-600">
                      10:43 AM
                      <Check size={12} className="text-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* Received */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-blue-600 text-xs font-bold">
                    A
                  </div>

                  <div>
                    <div className="rounded-2xl rounded-tl-md bg-white/6 px-4 py-3">
                      <p className="text-sm leading-6 text-slate-200">
                        Perfect. I'll send you the details soon 🚀
                      </p>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600">10:43 AM</p>
                  </div>
                </div>

                {/* Typing */}
                <div className="flex items-center gap-2 pl-11 text-xs text-slate-500">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                  </span>
                  Alex is typing...
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <input
                    disabled
                    placeholder="Type a message..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />

                  <button
                    disabled
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-cyan-400 to-blue-500"
                  >
                    <Send size={16} className="text-slate-950" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating card - left */}
            <div className="absolute -left-10 top-20 hidden rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Zap size={18} className="text-cyan-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Lightning fast
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Messages delivered instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card - right */}
            <div className="absolute -right-8 bottom-20 hidden rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10">
                  <Users size={18} className="text-violet-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Stay connected
                  </p>

                  <p className="text-[11px] text-slate-500">See who's online</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom section */}
        <section className="mx-auto max-w-3xl pb-10 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/3">
              <MessageCircle className="text-cyan-400" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Less noise. More connection.
          </h2>

          <p className="mt-3 text-slate-500">
            Everything you need for fast, effortless conversations.
          </p>
        </section>
      </div>
    </main>
  );
}
