import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  CheckSquare,
  FolderKanban,
  Zap,
  BarChart3,
  CalendarDays,
  Keyboard,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useCommandStore } from "../stores/useCommandStore";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleShortcutModal } = useCommandStore();

  const navItems = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/today", label: "Today", icon: CalendarCheck2 },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/focus", label: "Focus", icon: Zap },
    { to: "/planner", label: "Planner", icon: CalendarDays },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-[230px] bg-white border-r border-[#E6E8EC] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="h-14 px-5 flex items-center gap-2.5 border-b border-[#E6E8EC]">
          <div className="w-6 h-6 rounded-[6px] bg-[#176B5B] flex items-center justify-center text-white">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-[#172033] tracking-tight">
            Momentum
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-[7px] font-medium text-xs transition-colors ${
                  isActive
                    ? "bg-[#E8F3F0] text-[#176B5B] font-semibold"
                    : "text-[#667085] hover:text-[#172033] hover:bg-[#F7F8FA]"
                }`
              }
            >
              <item.icon className="w-[17px] h-[17px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[#E6E8EC] space-y-2">
        <button
          onClick={toggleShortcutModal}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-[7px] text-xs font-medium text-[#667085] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" /> Shortcuts
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#F7F8FA] border border-[#E6E8EC] rounded text-[#667085]">
            ?
          </kbd>
        </button>

        {user && (
          <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F7F8FA] border border-[#E6E8EC]">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-[#E6E8EC]"
              />
              <div className="truncate">
                <p className="text-xs font-medium text-[#172033] truncate">{user.name}</p>
                <p className="text-[10px] text-[#667085]">Lvl {user.level} • {user.xp} XP</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1 text-[#667085] hover:text-[#C94A4A] rounded hover:bg-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
