import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="flex min-h-screen" data-testid="settings-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Settings" description="Configure system preferences and options" />
        
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-cog text-6xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p className="text-muted-foreground">
                Settings interface coming soon. This will include configuration options for AI behavior, notification preferences, and system parameters.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
