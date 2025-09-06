import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ActivityFeed from "@/components/dashboard/activity-feed";
import IntegrationStatus from "@/components/dashboard/integration-status";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen" data-testid="dashboard-page">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Dashboard" 
          description="Monitor your AI-powered customer inquiry automation" 
        />
        
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Key Metrics */}
          <MetricsCards />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Activity Feed */}
            <ActivityFeed />
            
            {/* Quick Actions & Status */}
            <div className="space-y-6">
              <IntegrationStatus />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
