import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Briefcase, FileText, UserCircle, LayoutDashboard, PlusCircle, BarChart2, Users } from 'lucide-react';

const userLinks = [
  { name: 'Home', path: '/user/home', icon: <Home className="h-5 w-5" /> },
  { name: 'Jobs', path: '/user/jobs', icon: <Briefcase className="h-5 w-5" /> },
  { name: 'Apps', path: '/user/applications', icon: <FileText className="h-5 w-5" /> },
  { name: 'Profile', path: '/user/profile', icon: <UserCircle className="h-5 w-5" /> },
];

const companyLinks = [
  { name: 'Home', path: '/company/home', icon: <Home className="h-5 w-5" /> },
  { name: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Candidates', path: '/company/candidates', icon: <Users className="h-5 w-5" /> },
  { name: 'Applications', path: '/company/applications', icon: <FileText className="h-5 w-5" /> },
];

interface BottomNavBarProps {
  userRole: 'user' | 'company';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ userRole }) => {
  const location = useLocation();
  const links = userRole === 'user' ? userLinks : companyLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full transition-colors duration-200',
              location.pathname === link.path ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
            )}
          >
            {link.icon}
            <span className="text-xs mt-1">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}; 