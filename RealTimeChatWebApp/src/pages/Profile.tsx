import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import ProfileImageCard from "../components/profile/ProfileImageCard";
import ProfileInfoForm, {
  type ProfileFormData,
} from "../components/profile/ProfileInfoForm";
import ProfileLayout from "../components/profile/ProfileLayout";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { useProfileImage } from "../hooks/useProfileImage";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const navigate = useNavigate();

  const userId = useAuthStore((state) => state.userId);

  const { profile, isLoading, isUpdating, error, fieldErrors, updateProfile } =
    useUserProfile();

  const {
    selectedImage,
    preview,
    isUploading,
    isDeleting,
    error: imageError,
    success: imageSuccess,
    selectImage,
    uploadImage,
    cancelSelection,
    deleteImage,
  } = useProfileImage();

  const [localImage, setLocalImage] = useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalImage(profile?.image ?? null);
  }, [profile?.image]);

  const handleProfileSubmit = async (
    data: ProfileFormData,
    dirtyFields: Partial<Record<keyof ProfileFormData, boolean>>,
  ) => {
    setSaveSuccess(false);

    const updateData: {
      name?: string;
      username?: string;
      about?: string;
    } = {};

    if (dirtyFields.name) {
      updateData.name = data.name.trim();
    }

    if (dirtyFields.username) {
      updateData.username = data.username.trim();
    }

    if (dirtyFields.about) {
      updateData.about = data.about;
    }

    if (Object.keys(updateData).length === 0) {
      return false;
    }

    const success = await updateProfile(updateData);

    if (success) {
      setSaveSuccess(true);
    }

    return success;
  };

  const handleImageUpload = async () => {
    const imageUrl = await uploadImage();

    if (imageUrl) {
      setLocalImage(imageUrl);
    }
  };

  const handleImageDelete = async () => {
    const success = await deleteImage();

    if (success) {
      setLocalImage(null);
    }
  };

  if (!userId) {
    return (
      <main className="app-background">
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <AlertCircle size={36} className="mx-auto text-red-400" />

            <h1 className="mt-4 text-xl font-semibold">
              Unable to load profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We couldn't determine the current user.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Go to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-background">
      <div className="glow-blue -right-37.5 top-[25%]" />
      <div className="glow-purple -bottom-50 -left-37.5" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-400">Account</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Profile settings
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information and profile image.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />

            <p className="text-sm leading-6 text-red-300">{error}</p>
          </div>
        )}

        <ProfileLayout sidebar={<ProfileSidebar />}>
          {/* Image */}
          {isLoading ? (
            <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
              <div className="h-28 w-full animate-pulse rounded-2xl bg-white/4" />
            </section>
          ) : (
            <ProfileImageCard
              image={localImage}
              preview={preview}
              selectedImage={selectedImage}
              isUploading={isUploading}
              isDeleting={isDeleting}
              error={imageError}
              success={imageSuccess}
              onSelect={selectImage}
              onUpload={handleImageUpload}
              onCancel={cancelSelection}
              onDelete={handleImageDelete}
            />
          )}

          {/* Profile information */}
          {isLoading ? (
            <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8">
              <div className="space-y-5">
                <div className="h-11 animate-pulse rounded-xl bg-white/4" />
                <div className="h-11 animate-pulse rounded-xl bg-white/4" />
                <div className="h-28 animate-pulse rounded-xl bg-white/4" />
              </div>
            </section>
          ) : profile ? (
            <div>
              <ProfileInfoForm
                name={profile.name}
                username={profile.username}
                about={profile.about ?? ""}
                isSubmitting={isUpdating}
                serverErrors={fieldErrors}
                onSubmit={handleProfileSubmit}
              />

              {saveSuccess && (
                <div className="mt-4 flex items-center justify-end gap-2 text-sm text-emerald-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10">
                    ✓
                  </span>
                  Profile updated successfully.
                </div>
              )}
            </div>
          ) : null}
        </ProfileLayout>
      </div>
    </main>
  );
}
