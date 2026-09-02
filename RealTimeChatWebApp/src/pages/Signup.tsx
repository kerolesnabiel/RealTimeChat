import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  MessageCircle,
  User,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import axios from "axios";

import apiClient from "../api/apiClient";

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(25, "Name must be at most 25 characters."),

    username: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores.",
      ),

    password: z.string().min(8, "Password must be at least 8 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface ApiProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  Errors?: Record<string, string[]>;
}

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const [registeredUsername, setRegisteredUsername] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    setSuccess(false);

    try {
      await apiClient.post("/users/register", {
        name: data.name,
        username: data.username,
        password: data.password,
      });
      setRegisteredUsername(data.username);
      setSuccess(true);
    } catch (error) {
      if (!axios.isAxiosError<ApiProblemDetails>(error)) {
        setServerError("Something went wrong. Please try again.");

        return;
      }

      const status = error.response?.status;
      const problem = error.response?.data;

      // 400 - Validation errors
      if (status === 400) {
        const apiErrors = problem?.Errors;

        if (apiErrors) {
          for (const [field, messages] of Object.entries(apiErrors)) {
            const normalizedField = field.toLowerCase();

            if (normalizedField === "name" && messages.length > 0) {
              setError("name", {
                type: "server",
                message: messages.join(" "),
              });
            }

            if (normalizedField === "username" && messages.length > 0) {
              setError("username", {
                type: "server",
                message: messages.join(" "),
              });
            }

            if (normalizedField === "password" && messages.length > 0) {
              setError("password", {
                type: "server",
                message: messages.join(" "),
              });
            }
          }
        } else {
          setServerError(
            problem?.detail ||
              "Some of the information you entered is invalid.",
          );
        }

        return;
      }

      // 409 - Username already exists
      if (status === 409) {
        setError("username", {
          type: "server",
          message: "This username is already in use.",
        });

        return;
      }

      // 500+
      if (status && status >= 500) {
        setServerError(
          "Something went wrong on the server. Please try again later.",
        );

        return;
      }

      // Network error / server unavailable
      if (!error.response) {
        setServerError(
          "Unable to connect to the server. Please check your connection and try again.",
        );

        return;
      }

      // Other unexpected errors
      setServerError(
        problem?.detail || "We couldn't create your account. Please try again.",
      );
    }
  };

  const handleContinueToLogin = () => {
    navigate("/login", { state: { username: registeredUsername } });
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
                Create your account
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Join ChatTime and start connecting.
              </p>
            </div>

            {/* Success */}
            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Account created successfully
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Your ChatTime account is ready.
                    </p>

                    <button
                      className="cursor-pointer mt-3 inline-block text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                      onClick={handleContinueToLogin}
                    >
                      Continue to login →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General server error */}
            {serverError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <p className="text-sm leading-6 text-red-300">{serverError}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    disabled={isSubmitting || success}
                    {...register("name")}
                    className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.name
                        ? "border-red-400/50 focus:border-red-400"
                        : "border-white/10 focus:border-cyan-400/50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  />
                </div>

                {errors.name && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                    type="text"
                    autoComplete="username"
                    placeholder="john_doe"
                    disabled={isSubmitting || success}
                    {...register("username")}
                    className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.username
                        ? "border-red-400/50 focus:border-red-400"
                        : "border-white/10 focus:border-cyan-400/50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Letters, numbers, and underscores only.
                </p>

                {errors.username && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.username.message}
                  </p>
                )}
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    disabled={isSubmitting || success}
                    {...register("password")}
                    className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.password
                        ? "border-red-400/50 focus:border-red-400"
                        : "border-white/10 focus:border-cyan-400/50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isSubmitting || success}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    disabled={isSubmitting || success}
                    {...register("confirmPassword")}
                    className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                      errors.confirmPassword
                        ? "border-red-400/50 focus:border-red-400"
                        : "border-white/10 focus:border-cyan-400/50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={isSubmitting || success}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-5 py-3.5 font-semibold text-slate-950 shadow-xl shadow-cyan-500/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
