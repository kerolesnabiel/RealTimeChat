import {
  AlertCircle,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRef } from "react";

interface ProfileImageCardProps {
  image: string | null;
  preview: string | null;
  selectedImage: File | null;

  isUploading: boolean;
  isDeleting: boolean;

  error: string;
  success: string;

  onSelect: (file: File | undefined) => void;

  onUpload: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function ProfileImageCard({
  image,
  preview,
  selectedImage,
  isUploading,
  isDeleting,
  error,
  success,
  onSelect,
  onUpload,
  onCancel,
  onDelete,
}: ProfileImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview ?? image;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(event.target.files?.[0]);

    event.target.value = "";
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">Profile image</h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a photo that represents you.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ImagePlus size={14} />
          JPG, PNG, WEBP • Max 5 MB
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/3">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={40} className="text-slate-700" />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-800 text-slate-300 shadow-lg transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Choose profile image"
          >
            <Camera size={17} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-1 flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedImage ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-cyan-300">
                    New image selected
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-500">
                    {selectedImage.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isUploading}
                  className="text-slate-500 transition hover:text-white disabled:opacity-50"
                  aria-label="Cancel image selection"
                >
                  <X size={17} />
                </button>
              </div>

              <button
                type="button"
                onClick={onUpload}
                disabled={isUploading}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save image
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={16} />
              Choose image
            </button>
          )}

          {image && !selectedImage && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isUploading}
              className="inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-400/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Remove image
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
          <Check size={17} className="mt-0.5 shrink-0" />

          {success}
        </div>
      )}
    </section>
  );
}
