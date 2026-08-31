import { MessageCircle } from "lucide-react";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105">
              <MessageCircle
                size={19}
                strokeWidth={2.2}
                className="text-white"
              />
            </div>

            <span className="text-lg font-semibold tracking-tight text-white">
              ChatTime
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-4"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:px-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
