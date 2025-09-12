import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { HealthCheck } from "./components/HealthCheck";
import Home from "./pages/Home";
import RoleSelection from "./pages/RoleSelection";
import Jobs from "./pages/Jobs";
import Internships from "./pages/Internships";
import PostJob from "./pages/PostJob";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import JobApplication from "./pages/JobApplication";
import NotFound from "./pages/NotFound";
import { UserLayout } from "./pages/admin/user/UserLayout";
import { UserHome } from "./pages/admin/user/UserHome";
import { UserDashboard } from "./pages/admin/user/UserDashboard";
import { UserJobs } from "./pages/admin/user/UserJobs";
import UserProfile from "./pages/admin/user/UserProfile";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import { CompanyLayout } from "./pages/company/CompanyLayout";
import CompanyHome from "./pages/company/CompanyHome";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyApplications from './pages/admin/user/MyApplications';
import React, { Suspense } from "react";
import { AuthProvider } from '@/context/AuthContext';
import PublicRoute from './components/PublicRoute';
import CompanyAnalytics from "./pages/company/CompanyAnalytics";
import { Applications } from "./pages/company/Applications";
import { Candidates } from "./pages/company/Candidates";
import { JobApplications } from "./pages/company/JobApplications";
import Interviews from "./pages/user/Interviews";
import Chat from "./pages/Chat";
import UserChat from "./pages/user/UserChat";

const queryClient = new QueryClient();
const UserSettings = React.lazy(() => import('./pages/admin/user/Settings'));

// Component to conditionally render footer
const AppContent = () => {
  const location = useLocation();
  const isPublicPage = !(
    location.pathname.startsWith('/user') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/company') ||
    location.pathname.startsWith('/apply') ||
    location.pathname.startsWith('/job-application')
  );

  return (
        <div className="min-h-screen flex flex-col">
          {isPublicPage && <Header />}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RoleSelection />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/userlogin" element={<Navigate to="/login" replace />} />
              <Route path="/companylogin" element={<Navigate to="/login" replace />} />
              
              {/* Legacy routes - redirect to user scoped routes */}
              <Route path="/job-application/:id" element={<Navigate to="/user/apply/:id" replace />} />
              <Route path="/apply/:id" element={<Navigate to="/user/apply/:id" replace />} />
          <Route path="/user" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
            <Route index element={<UserHome />} />
            <Route path="home" element={<UserHome />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="jobs" element={<UserJobs />} />
            <Route path="settings" element={<Suspense fallback={<div>Loading...</div>}><UserSettings /></Suspense>} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="internships" element={<Internships />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="chat" element={<UserChat />} />
            {/* New: Apply page under user layout so the user sidebar is visible */}
            <Route path="apply/:id" element={<JobApplication />} />
          </Route>
          <Route path="/company" element={
            <ProtectedRoute role="company">
              <CompanyLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CompanyHome />} />
            <Route path="home" element={<CompanyHome />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="analytics" element={<CompanyAnalytics />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="applications" element={<Applications />} />
            <Route path="jobs/:jobId/applications" element={<JobApplications />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="post-job" element={<PostJob />} />
          </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {isPublicPage && <Footer />}
          <HealthCheck />
        </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
