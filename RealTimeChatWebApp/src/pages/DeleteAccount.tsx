import { useNavigate } from "react-router";

import DeleteAccountCard from "../components/profile/DeleteAccountCard";
import ProfileLayout from "../components/profile/ProfileLayout";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useAuthStore } from "../store/authStore";

export default function DeleteAccount() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const { isDeleting, error, deleteAccount, clearError } = useDeleteUser();

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();

    if (!success) {
      return false;
    }

    logout();
    navigate("/", { replace: true });

    return true;
  };

  return (
    <main className="app-background">
      <div className="glow-blue -right-37.5 top-[25%]" />
      <div className="glow-purple -bottom-50 -left-37.5" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-400">Account</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Delete account
          </h1>

          <p className="mt-2 text-slate-500">
            Permanently remove your ChatTime account.
          </p>
        </div>

        <ProfileLayout sidebar={<ProfileSidebar />}>
          <DeleteAccountCard
            isDeleting={isDeleting}
            error={error}
            onDelete={handleDeleteAccount}
            onClearError={clearError}
          />
        </ProfileLayout>
      </div>
    </main>
  );
}
