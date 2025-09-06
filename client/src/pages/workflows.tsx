import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

export default function Workflows() {
  return (
    <div className="flex min-h-screen" data-testid="workflows-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Workflows" description="Configure automation workflows" />
        
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-project-diagram text-6xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">Workflow Management</h3>
              <p className="text-muted-foreground">
                Workflow configuration interface coming soon. This will allow you to set up custom automation rules and response patterns.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
