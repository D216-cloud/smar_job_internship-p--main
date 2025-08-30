import { Outlet } from "react-router-dom";
import Sidebar, { SidebarToggleProvider, useSidebarToggle } from "@/components/common/Sidebar";
import { Menu, LayoutDashboard, Home, PlusCircle, Users, FileText, BarChart2, UserCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { BottomNavBar } from "@/components/common/BottomNavBar";

const companyLinks = [
  { name: "Dashboard", path: "/company/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Home", path: "/company/home", icon: <Home className="h-5 w-5" /> },
  { name: "Post Job", path: "/company/post-job", icon: <PlusCircle /> },
  { name: "Candidates", path: "/company/candidates", icon: <Users /> },
  { name: "Applications", path: "/company/applications", icon: <FileText /> },
  { name: "Analytics", path: "/company/analytics", icon: <BarChart2 /> },
  { name: "Profile", path: "/company/profile", icon: <UserCircle /> },
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
  } : { paddingBottom: '80px' };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        links={companyLinks} 
        isOpen={isMobile ? isOpen : true} 
        isCollapsed={isMobile ? false : isCollapsed}
        toggleCollapse={toggleCollapse}
        onClose={close} 
        variant={isMobile ? "overlay" : "push"}
        userRole="company"
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
      <BottomNavBar userRole="company" />
    </div>
  );
};

export const CompanyLayout = () => {
  return (
    <SidebarToggleProvider>
      <LayoutContent />
    </SidebarToggleProvider>
  );
}; 