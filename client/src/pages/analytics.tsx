import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="flex min-h-screen" data-testid="analytics-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Analytics" description="View detailed analytics and reports" />
        
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-chart-bar text-6xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Detailed analytics dashboard coming soon. This will include comprehensive reporting on AI performance, user satisfaction, and trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
