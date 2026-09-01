import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ChangePasswordFieldErrors } from "../../hooks/useChangePassword";

const changePasswordSchema = z
  .object({
    password: z.string().min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),

    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  isChanging: boolean;
  error: string;
  fieldErrors: ChangePasswordFieldErrors;
  success: boolean;

  onSubmit: (data: ChangePasswordFormData) => Promise<boolean>;

  onClearMessages: () => void;
}

export default function ChangePasswordForm({
  isChanging,
  error,
  fieldErrors,
  success,
  onSubmit,
  onClearMessages,
}: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = async (data: ChangePasswordFormData) => {
    await onSubmit(data);
  };

  const handleInputChange = () => {
    if (error || success) {
      onClearMessages();
    }
  };

  const handleSuccessReset = () => {
    reset();
    onClearMessages();
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
          <KeyRound size={21} className="text-cyan-400" />
        </div>

        <h2 className="mt-5 font-semibold text-white">Change password</h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose a new password to keep your account secure.
        </p>
      </div>

      {/* General error */}
      {error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />

          <p className="text-sm leading-6 text-red-300">{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"
        >
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Password changed successfully.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Your password has been updated.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(submit)}
        onChange={handleInputChange}
        className="mt-8 space-y-6"
        noValidate
      >
        {/* Current password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Current password
          </label>

          <div className="relative">
            <KeyRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="password"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your current password"
              disabled={isChanging}
              {...register("password")}
              className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                errors.password || fieldErrors.password
                  ? "border-red-400/50 focus:border-red-400"
                  : "border-white/10 focus:border-cyan-400/50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword((value) => !value)}
              disabled={isChanging}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
              aria-label={
                showCurrentPassword
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {(errors.password || fieldErrors.password) && (
            <p className="mt-2 text-xs text-red-400">
              {errors.password?.message ?? fieldErrors.password}
            </p>
          )}
        </div>

        {/* New password */}
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            New password
          </label>

          <div className="relative">
            <KeyRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={isChanging}
              {...register("newPassword")}
              className={`w-full rounded-xl border bg-white/3 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                errors.newPassword || fieldErrors.newPassword
                  ? "border-red-400/50 focus:border-red-400"
                  : "border-white/10 focus:border-cyan-400/50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <button
              type="button"
              onClick={() => setShowNewPassword((value) => !value)}
              disabled={isChanging}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {(errors.newPassword || fieldErrors.newPassword) && (
            <p className="mt-2 text-xs text-red-400">
              {errors.newPassword?.message ?? fieldErrors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm new password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Confirm new password
          </label>

          <div className="relative">
            <KeyRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              disabled={isChanging}
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
              disabled={isChanging}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-2 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t border-white/10 pt-6">
          <button
            type="submit"
            disabled={isChanging}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {isChanging ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Change password"
            )}
          </button>
        </div>
      </form>

      {success && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSuccessReset}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-300"
          >
            Change it again
          </button>
        </div>
      )}
    </section>
  );
}
