import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, User, UserPlus, LayoutDashboard, ListOrdered, LogOut, Users, Calendar, Activity, Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuth();
  
  useEffect(() => {
    // Set document title and meta
    document.title = 'Menaharia Medium Clinic';
    
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        "font-body"
      )}
    >
      <SidebarProvider>
        <Sidebar>
          <SidebarContent className="flex flex-col">
            <header className="p-4 flex items-center gap-2">
              <Link to="/" className="font-bold text-xl text-primary">Menaharia Medium Clinic</Link>
            </header>
            <nav className="flex flex-col gap-2 p-4">
              <Link to="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                <Home size={20} />
                <span>Home</span>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <User size={20} />
                  <span>Login</span>
                </Link>
              )}
              {isAuthenticated && user?.role === 'reception' && (
                <>
                  <Link to="/reception/add-user" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <UserPlus size={20} />
                    <span>Add Patient</span>
                  </Link>
                  <Link to="/reception/patient-management" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Users size={20} />
                    <span>Patient Management</span>
                  </Link>
                  <Link to="/reception/queue" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <ListOrdered size={20} />
                    <span>Patient Queue</span>
                  </Link>
                </>
              )}
              {isAuthenticated && user?.role === 'nurse' && (
                <>
                  <Link to="/reception/patient-management" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Users size={20} />
                    <span>Patient Management</span>
                  </Link>
                  <Link to="/reception/queue" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <ListOrdered size={20} />
                    <span>Patient Queue</span>
                  </Link>
                </>
              )}
              {isAuthenticated && (user?.role === 'doctor' || user?.role === 'laboratory') && (
                <Link to="/reception/queue" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <ListOrdered size={20} />
                  <span>Patient Queue</span>
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <LayoutDashboard size={20} />
                    <span>Admin Dashboard</span>
                  </Link>
                  <Link to="/staff-management" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Users size={20} />
                    <span>Staff Management</span>
                  </Link>
                  <Link to="/patients" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <UserPlus size={20} />
                    <span>Patient Management</span>
                  </Link>
                  <Link to="/appointments" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Calendar size={20} />
                    <span>Appointments</span>
                  </Link>
                  <Link to="/reports" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Activity size={20} />
                    <span>Reports & Analytics</span>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                  </Link>
                </>
              )}
              {isAuthenticated && (user?.role === 'doctor' || user?.role === 'laboratory') && (
                <>
                  <Link to="/reception/queue" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <ListOrdered size={20} />
                    <span>Patient Queue</span>
                  </Link>
                  <Link to="/staff-management" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <Users size={20} />
                    <span>Staff Management</span>
                  </Link>
                </>
              )}
            </nav>
            {isAuthenticated && (
              <div className="mt-auto p-4 border-t">
                <div className="mb-2 text-sm text-muted-foreground">
                  Logged in as: <span className="font-medium">{user?.name}</span>
                </div>
                <Button onClick={logout} variant="outline" size="sm" className="w-full">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="p-4 flex items-center justify-between md:hidden sticky top-0 bg-background z-10 border-b">
            <Link to="/" className="font-bold text-lg text-primary">Menaharia Medium Clinic</Link>
            <SidebarTrigger />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}