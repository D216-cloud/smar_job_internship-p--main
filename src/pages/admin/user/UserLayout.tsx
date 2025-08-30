import { Outlet } from "react-router-dom";
import Sidebar, { SidebarToggleProvider, useSidebarToggle } from "@/components/common/Sidebar";
import { Menu, LayoutDashboard, Home, Briefcase, FileText, UserCircle, Calendar, Star, MessageCircle, BookOpen as BookOpenIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { BottomNavBar } from "@/components/common/BottomNavBar";

const userLinks = [
  { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Home", path: "/user/home", icon: <Home /> },
  { name: "Browse Jobs", path: "/user/jobs", icon: <Briefcase /> },
  { name: "Internships", path: "/user/internships", icon: <Star /> },
  { name: "My Applications", path: "/user/applications", icon: <FileText /> },
  { name: "AI Chat", path: "/user/chat", icon: <MessageCircle /> },
  { name: "Profile", path: "/user/profile", icon: <UserCircle /> },
  { name: "Interviews", path: "/user/interviews", icon: <Calendar /> },
  { name: "Score Your Resume", path: "https://score-my-resume-vrf4.vercel.app/", icon: <BookOpenIcon className="h-5 w-5" /> },
];

const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

const LayoutContent = () => {
  const { open, close, isOpen } = useSidebarToggle();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = useMemo(() => {
    if (isMobile) return '100vw';
    return isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  }, [isCollapsed, isMobile]);

  const mainStyle = !isMobile ? {
    marginLeft: `${sidebarWidth}px`,
    width: `calc(100% - ${sidebarWidth}px)`,
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : { paddingBottom: '80px' }; // Add padding to avoid overlap with bottom nav bar

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        links={userLinks} 
        isOpen={isMobile ? isOpen : true} 
        isCollapsed={isMobile ? false : isCollapsed}
        toggleCollapse={toggleCollapse}
        onClose={close} 
        variant={isMobile ? "overlay" : "push"} 
        userRole="user"
      />
      <main
        className="flex-1 p-8 transition-all duration-300"
        style={mainStyle}
      >
        {isMobile && (
          <button className="mb-4" onClick={open} aria-label="Open sidebar">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <Outlet />
      </main>
      <BottomNavBar userRole="user" />
    </div>
  );
};

export const UserLayout = () => (
  <SidebarToggleProvider>
    <LayoutContent />
  </SidebarToggleProvider>
);