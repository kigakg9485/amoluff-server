import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import VerificationForm from "@/components/verification-form";
import ApplicationCards from "@/components/application-cards";
import AdminPanel from "@/components/admin-panel";
import ApplicationModals from "@/components/application-modals";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Check verification status on component mount
  useEffect(() => {
    const discordVerified = localStorage.getItem('discord_verified');
    if (discordVerified === 'true') {
      setIsVerified(true);
    }
  }, []);

  // Fetch application settings
  const { data: applicationSettings } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/application-settings'],
    enabled: isVerified,
  });

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  const handleUserLogout = () => {
    // Clear user verification
    localStorage.removeItem('discord_verified');
    localStorage.removeItem('discord_username');
    localStorage.removeItem('discord_userId');
    setIsVerified(false);
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/50">
              <img 
                src="/assets/AMOLUFF_1757172176929.gif" 
                alt="AMOLUFF Server" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent neon-text">
                سيرفر amoluff
              </h1>
              {isVerified && (
                <p className="text-xs text-muted-foreground mt-1">
                  مرحباً، {localStorage.getItem('discord_username')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isVerified && (
              <button
                data-testid="button-user-logout"
                onClick={handleUserLogout}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50"
                title="تسجيل الخروج"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            )}
            <button 
              data-testid="button-admin-menu"
              onClick={() => setIsAdminPanelOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50"
              title="لوحة الإدارة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isVerified ? (
          <VerificationForm onSuccess={handleVerificationSuccess} />
        ) : (
          <ApplicationCards 
            applicationSettings={applicationSettings}
          />
        )}
      </main>

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {/* Application Modals */}
      <ApplicationModals />
    </div>
  );
}