import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

interface DeleteAccountCardProps {
  isDeleting: boolean;
  error: string;
  onDelete: () => Promise<boolean>;
  onClearError: () => void;
}

export default function DeleteAccountCard({
  isDeleting,
  error,
  onDelete,
  onClearError,
}: DeleteAccountCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleOpen = () => {
    onClearError();
    setIsConfirmOpen(true);
  };

  const handleClose = () => {
    if (isDeleting) {
      return;
    }

    onClearError();
    setIsConfirmOpen(false);
  };

  const handleDelete = async () => {
    await onDelete();
  };

  return (
    <>
      <section className="rounded-3xl border border-red-400/10 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                <Trash2 size={19} className="text-red-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">Delete account</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Permanently remove your ChatTime account.
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
              This action is permanent. Your account and associated data may no
              longer be recoverable after deletion.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/10 hover:text-red-300"
          >
            <Trash2 size={16} />
            Delete account
          </button>
        </div>
      </section>

      {/* Confirmation dialog */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
                  <AlertTriangle size={21} className="text-red-400" />
                </div>

                <div>
                  <h2
                    id="delete-account-title"
                    className="font-semibold text-white"
                  >
                    Delete your account?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-400">
              Deleting your account will permanently remove your ChatTime
              account. Make sure you really want to continue.
            </p>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                className="rounded-xl border border-white/10 bg-white/3 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Permanently delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
