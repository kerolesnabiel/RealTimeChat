import {
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";

import { useAuthStore } from "../store/authStore";

interface ApiProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
}

interface LoginLocationState {
  username?: string;
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const locationState = location.state as LoginLocationState | null;

  const [username, setUsername] = useState(locationState?.username ?? "");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      window.history.replaceState({}, "");
      navigate("/chats", { replace: true });
    } catch (error) {
      if (axios.isAxiosError<ApiProblemDetails>(error)) {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        if (status === 401) {
          setErrorMessage("Invalid username or password.");
        } else if (status && status >= 500) {
          setErrorMessage(
            "Something went wrong on the server. Please try again later.",
          );
        } else if (!error.response) {
          setErrorMessage(
            "Unable to connect to the server. Please check your connection and try again.",
          );
        } else {
          setErrorMessage(
            detail || "We couldn't log you in. Please try again.",
          );
        }
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-background">
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
                <MessageCircle size={24} className="text-white" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Log in to continue to ChatTime.
              </p>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <p className="text-sm leading-6 text-red-300">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="john_doe"
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Your password"
                    disabled={isSubmitting}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/3 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !username.trim() || !password}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-5 py-3.5 font-semibold text-slate-950 shadow-xl shadow-cyan-500/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            {/* Signup */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
