import {
  Home,
  FileText,
  CalendarDays,
  Users,
  Twitter,
  Github,
  Instagram,
  Mail,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import supabase from "../../services/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const tabs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Blogs", icon: FileText, path: "/blogs" },
    { name: "Events", icon: CalendarDays, path: "/events" },
    { name: "Team", icon: Users, path: "/team" },
  ];

  const socials = [
    { icon: Twitter, link: "#" },
    { icon: Github, link: "#" },
    { icon: Instagram, link: "#" },
    { icon: Mail, link: "#" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full flex justify-between items-center px-8">
      {/* LEFT SPACER (for centering) */}
      <div className="flex-1"></div>

      {/* MAIN NAVBAR (CENTERED) */}
      <div className="flex items-center gap-6 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
        {/* LEFT TABS */}
        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className={`flex cursor-pointer items-center gap-3 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 
                  ${
                    active
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* RIGHT SOCIAL ICONS */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          {socials.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.link}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </div>

      {/* FLOATING AUTH BUTTONS (RIGHT SIDE) */}
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-2 px-4 py-2  rounded-full shadow-lg">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex cursor-pointer items-center gap-2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 border border-white/10"
              >
                <User size={20} />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpenMenu(false);
                    }}
                    className="w-full cursor-pointer text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full cursor-pointer text-left px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm font-medium"
              >
                <LogIn size={16} />
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 border border-white/10 text-sm font-medium"
              >
                <UserPlus size={16} />
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
