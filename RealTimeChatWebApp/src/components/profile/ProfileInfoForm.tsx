import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ProfileFieldErrors } from "../../hooks/useUserProfile";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(25, "Name must be at most 25 characters."),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(25, "Username must be at most 25 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores.",
    ),

  about: z.string(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileInfoFormProps {
  name: string;
  username: string;
  about: string;

  isSubmitting: boolean;

  serverErrors: ProfileFieldErrors;

  onSubmit: (
    data: ProfileFormData,
    dirtyFields: Partial<Record<keyof ProfileFormData, boolean>>,
  ) => Promise<boolean>;
}

export default function ProfileInfoForm({
  name,
  username,
  about,
  isSubmitting,
  serverErrors,
  onSubmit,
}: ProfileInfoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name,
      username,
      about,
    },
  });

  useEffect(() => {
    reset({ name, username, about });
  }, [name, username, about, reset]);

  useEffect(() => {
    clearErrors(["name", "username", "about"]);

    if (serverErrors.name) {
      setError("name", { type: "server", message: serverErrors.name });
    }

    if (serverErrors.username) {
      setError("username", { type: "server", message: serverErrors.username });
    }

    if (serverErrors.about) {
      setError("about", { type: "server", message: serverErrors.about });
    }
  }, [serverErrors, setError, clearErrors]);

  const submit = async (data: ProfileFormData) => {
    await onSubmit(data, dirtyFields);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
      <div>
        <h2 className="font-semibold text-white">Personal information</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the information associated with your ChatTime account.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            disabled={isSubmitting}
            className={`w-full rounded-xl border bg-white/3 px-4 py-3 text-sm text-white outline-none transition ${
              errors.name
                ? "border-red-400/50 focus:border-red-400"
                : "border-white/10 focus:border-cyan-400/50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />

          {errors.name && (
            <p className="mt-2 text-xs text-red-400">{errors.name.message}</p>
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

          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register("username")}
            disabled={isSubmitting}
            className={`w-full rounded-xl border bg-white/3 px-4 py-3 text-sm text-white outline-none transition ${
              errors.username
                ? "border-red-400/50 focus:border-red-400"
                : "border-white/10 focus:border-cyan-400/50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />

          <p className="mt-2 text-xs text-slate-600">
            3–25 characters. Letters, numbers, and underscores only.
          </p>

          {errors.username && (
            <p className="mt-2 text-xs text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* About */}
        <div>
          <label
            htmlFor="about"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            About
          </label>

          <textarea
            id="about"
            rows={5}
            placeholder="Tell people a little about yourself..."
            {...register("about")}
            disabled={isSubmitting}
            className={`w-full resize-none rounded-xl border bg-white/3 px-4 py-3 text-sm leading-6 text-white outline-none transition ${
              errors.about
                ? "border-red-400/50 focus:border-red-400"
                : "border-white/10 focus:border-cyan-400/50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />

          {errors.about && (
            <p className="mt-2 text-xs text-red-400">{errors.about.message}</p>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-sm text-emerald-400"></div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
