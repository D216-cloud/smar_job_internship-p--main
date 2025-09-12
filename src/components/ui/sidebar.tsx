import { Home, BarChart, User, Briefcase, LogOut, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

const companyLinks = [
  { name: "Dashboard", path: "/company/dashboard", icon: Home },
  { name: "Home", path: "/company/home", icon: Home },
  { name: "Post Job", path: "/company/post-job", icon: PlusCircle },
  { name: "Analytics", path: "/company/analytics", icon: BarChart },
  { name: "Profile", path: "/company/profile", icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout, userData } = useAuthContext();

  return (
    <aside className="flex flex-col h-screen w-64 bg-white shadow-lg border-r">
      {/* Logo and User Info */}
      <div className="flex flex-col items-center py-8 border-b">
        <img 
          src="/careersnap-logo.svg" 
          alt="CareerSnap - AI-Powered Career Matching" 
          className="h-12 mb-3 transition-all duration-300 hover:scale-105" 
        />
        <div className="font-bold text-lg">{userData?.name || "Company Name"}</div>
        <div className="text-xs text-gray-500">{userData?.email}</div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {companyLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? "bg-blue-100 text-blue-700 font-semibold shadow"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}
              `}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      {/* Logout Button */}
      <div className="px-4 py-6 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
