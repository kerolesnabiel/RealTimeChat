import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="app-background">
      <div className="relative flex min-h-screen items-center justify-center px-6 mt-10">
        <div className="mx-auto max-w-xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/5 shadow-2xl shadow-cyan-500/10">
            <MessageCircle size={34} className="text-cyan-400" />
          </div>

          {/* Number */}
          <div className="text-8xl font-black tracking-tighter sm:text-9xl">
            <span className="bg-linear-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            This conversation doesn't exist.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-400">
            Looks like you've wandered somewhere that doesn't have a message
            thread. Let's get you back to where the conversation is happening.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <Home size={17} />
              Back home
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 px-5 py-3 font-semibold text-white transition hover:bg-white/[0.07]"
            >
              <ArrowLeft size={17} />
              Go back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
