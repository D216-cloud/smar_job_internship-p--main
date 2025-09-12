import React, { createContext, useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  User,
  Search,
  PlusCircle,
  Calendar,
  Home,
  X,
  Menu,
  Bell,
  Globe,
  LogOut,
  HelpCircle,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Mail,
  UserCircle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  BookOpen
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  links: { name: string; path: string; icon: React.ReactNode }[];
  isOpen: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onClose: () => void;
  variant?: "overlay" | "push";
  userRole?: "user" | "admin" | "company";
}

const SidebarToggleContext = createContext<{
  open: () => void;
  close: () => void;
  isOpen: boolean;
} | null>(null);

export const useSidebarToggle = () => {
  const ctx = useContext(SidebarToggleContext);
  if (!ctx) throw new Error("useSidebarToggle must be used within SidebarToggleProvider");
  return ctx;
};

export const SidebarToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return (
    <SidebarToggleContext.Provider value={{ open, close, isOpen }}>
      {children}
    </SidebarToggleContext.Provider>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  links = [],
  isOpen,
  onClose,
  variant = "overlay",
  userRole = "user",
  isCollapsed,
  toggleCollapse,
}) => {
  const location = useLocation();
  const [showMobileMenuBar, setShowMobileMenuBar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Get logout and userData from AuthContext
  const { logout, userData } = useAuthContext();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowMobileMenuBar(true);
        setShowSidebar(false);
      } else {
        setShowMobileMenuBar(false);
        setShowSidebar(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar width logic
  const expandedWidth = isMobile ? '80vw' : '16rem'; // 20% less than 20rem
  const collapsedWidth = '4rem';
  const sidebarStyle = {
    width: isCollapsed ? collapsedWidth : expandedWidth,
    minWidth: isCollapsed ? collapsedWidth : expandedWidth,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 50,
  };

  const handleLogout = () => {
    logout();
    onClose();
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Mobile menu bar (hamburger)
  if (isMobile && showMobileMenuBar && !showSidebar) {
    return (
      <div className="fixed top-0 left-0 w-full h-14 bg-white shadow z-50 flex items-center px-4 justify-between">
        <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="rounded-full">
          <Menu className="h-7 w-7 text-blue-600" />
        </Button>
        <img src="/careersnap-logo.svg" alt="CareerSnap - AI-Powered Career Matching" className="h-7 w-auto" />
      </div>
    );
  }

  // Sidebar overlay for mobile
  return (
    <>
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => { setShowSidebar(false); setShowMobileMenuBar(true); }}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-white shadow-xl transition-all duration-300",
          isMobile && !showSidebar && "-translate-x-full"
        )}
        style={sidebarStyle}
      >
        {/* Header with logo and collapse/expand button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!isCollapsed && (
            <Link
              to={userRole === "admin" ? "/admin" : userRole === "company" ? "/company/home" : "/user/home"}
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <img 
                src="/careersnap-logo.svg" 
                alt="CareerSnap - AI-Powered Career Matching" 
                className="h-8 w-auto transition-all duration-300 hover:scale-105" 
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="rounded-full hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col overflow-y-auto p-4">
          <TooltipProvider>
            {links.map((link) => {
              const isExternal = /^https?:\/\//.test(link.path);
              return (
                <Tooltip key={link.path || link.name} delayDuration={100}>
                  <TooltipTrigger asChild>
                    {isExternal ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                          isCollapsed ? "justify-center" : "px-4",
                          "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                        )}
                        onClick={() => { onClose(); if (isMobile) { setShowSidebar(false); setShowMobileMenuBar(true); } }}
                      >
                        <span className={cn(
                          "p-2 rounded-lg bg-gray-100 text-gray-600"
                        )}>
                          {link.icon}
                        </span>
                        {!isCollapsed && <span>{link.name}</span>}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                          location.pathname === link.path
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium border border-blue-100"
                            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600",
                          isCollapsed ? "justify-center" : "px-4"
                        )}
                        onClick={() => { onClose(); if (isMobile) { setShowSidebar(false); setShowMobileMenuBar(true); } }}
                      >
                        <span className={cn(
                          "p-2 rounded-lg",
                          location.pathname === link.path
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {link.icon}
                        </span>
                        {!isCollapsed && <span>{link.name}</span>}
                      </Link>
                    )}
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-gray-800 text-white">
                      <p>{link.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
        {/* Footer with user profile */}
        <div className="border-t border-gray-100 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              onClick={toggleProfileDropdown}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData?.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {userData?.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                      {userData?.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {userData?.email || 'email@example.com'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-gray-400 transition-transform duration-200",
                    isProfileDropdownOpen && "rotate-180"
                  )}
                />
              )}
            </Button>
            {/* Profile dropdown */}
            {isProfileDropdownOpen && (
              <div
                className={cn(
                  "absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-[60]",
                  isCollapsed ? "w-56" : "w-full"
                )}
                style={{ 
                  minWidth: isCollapsed ? "14rem" : undefined,
                  transform: 'translateY(-8px)'
                }}
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData?.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {userData?.firstName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {userData?.firstName || 'User'} {userData?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">
                        {userData?.email || 'email@example.com'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;