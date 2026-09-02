import ProfileLayout from "../components/profile/ProfileLayout";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";
import { useChangePassword } from "../hooks/useChangePassword";

export default function ChangePassword() {
  const {
    isChanging,
    error,
    fieldErrors,
    success,
    changePassword,
    clearMessages,
  } = useChangePassword();

  const handleSubmit = async (data: {
    password: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return changePassword({
      password: data.password,
      newPassword: data.newPassword,
    });
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
            Change password
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your ChatTime account secure with a strong password.
          </p>
        </div>

        <ProfileLayout sidebar={<ProfileSidebar />}>
          <ChangePasswordForm
            isChanging={isChanging}
            error={error}
            fieldErrors={fieldErrors}
            success={success}
            onSubmit={handleSubmit}
            onClearMessages={clearMessages}
          />
        </ProfileLayout>
      </div>
    </main>
  );
}
