import { KeyRound, Trash2, UserRound } from "lucide-react";
import { NavLink } from "react-router";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  end?: boolean;
}

function SidebarItem({
  to,
  icon,
  children,
  disabled = false,
  end = false,
}: SidebarItemProps) {
  if (disabled) {
    return (
      <div className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600">
        {icon}
        {children}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-white/6 text-cyan-400"
            : "text-slate-500 hover:bg-white/3 hover:text-slate-300"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

export default function ProfileSidebar() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2 backdrop-blur-xl">
      <SidebarItem to="/profile" end icon={<UserRound size={17} />}>
        Profile
      </SidebarItem>

      <SidebarItem to="/profile/change-password" icon={<KeyRound size={17} />}>
        Change password
      </SidebarItem>

      <SidebarItem to="/profile/delete-account" icon={<Trash2 size={17} />}>
        Delete account
      </SidebarItem>
    </div>
  );
}
