import { Outlet } from "react-router-dom";
import Sidebar, { SidebarToggleProvider, useSidebarToggle } from "@/components/common/Sidebar";
import { Menu, LayoutDashboard, PlusCircle, Users, Settings } from "lucide-react";
import { useState, useMemo } from "react";

const adminLinks = [
  { name: "Dashboard", path: "/admin", icon: <LayoutDashboard /> },
  { name: "Post Job", path: "/admin/post-job", icon: <PlusCircle /> },
  { name: "Manage Users", path: "/admin/users", icon: <Users /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings /> },
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
  } : {};

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        links={adminLinks}
        isOpen={isMobile ? isOpen : true}
        isCollapsed={isMobile ? false : isCollapsed}
        toggleCollapse={toggleCollapse}
        onClose={close}
        variant={isMobile ? "overlay" : "push"}
        userRole="admin"
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
    </div>
  );
};

export const AdminLayout = () => (
  <SidebarToggleProvider>
  <LayoutContent />
  </SidebarToggleProvider>
);