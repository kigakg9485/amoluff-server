import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IntegrationStatus() {
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="w-12 h-5 bg-muted rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIntegrationIcon = (type: string) => {
    const icons = {
      slack: "fab fa-slack text-primary",
      teams: "fab fa-microsoft text-chart-4",
      discord: "fab fa-discord text-chart-3",
      zendesk: "fas fa-ticket-alt text-chart-1",
    };
    return icons[type as keyof typeof icons] || "fas fa-plug text-muted-foreground";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "secondary" as const, color: "text-chart-2", icon: "w-2 h-2 bg-chart-2 rounded-full" };
      case "pending":
        return { variant: "secondary" as const, color: "text-chart-4", icon: "w-2 h-2 bg-chart-4 rounded-full" };
      case "error":
        return { variant: "destructive" as const, color: "text-destructive", icon: "w-2 h-2 bg-destructive rounded-full" };
      default:
        return { variant: "secondary" as const, color: "text-muted-foreground", icon: "w-2 h-2 bg-muted-foreground rounded-full" };
    }
  };

  return (
    <Card data-testid="integration-status">
      <CardHeader className="border-b border-border">
        <CardTitle>Integration Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {integrations.length === 0 ? (
          <div className="text-center py-8" data-testid="integrations-empty">
            <i className="fas fa-plug text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No integrations configured</p>
          </div>
        ) : (
          integrations.map((integration: any, index: number) => (
            <div key={integration.id} className="flex items-center justify-between" data-testid={`integration-item-${index}`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className={getIntegrationIcon(integration.type)}></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground" data-testid={`integration-name-${index}`}>
                    {integration.name}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`integration-type-${index}`}>
                    {integration.type} integration
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={getStatusBadge(integration.status).icon}></div>
                <span className={`text-xs ${getStatusBadge(integration.status).color}`} data-testid={`integration-status-${index}`}>
                  {integration.status}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
