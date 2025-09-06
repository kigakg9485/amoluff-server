import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["/api/inquiries"],
    select: (data: any[]) => data.slice(0, 10), // Show last 10 activities
  });

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "auto_resolved":
        return "fas fa-robot text-primary";
      case "escalated":
        return "fas fa-user text-chart-4";
      case "resolved":
        return "fas fa-check text-chart-2";
      default:
        return "fas fa-clock text-muted-foreground";
    }
  };

  const getActivityDescription = (inquiry: any) => {
    switch (inquiry.status) {
      case "auto_resolved":
        return `AI Agent automatically resolved inquiry about "${inquiry.content.substring(0, 50)}..."`;
      case "escalated":
        return `Manual Review escalated complex inquiry about "${inquiry.content.substring(0, 50)}..."`;
      case "resolved":
        return `Human agent resolved inquiry about "${inquiry.content.substring(0, 50)}..."`;
      default:
        return `New inquiry received: "${inquiry.content.substring(0, 50)}..."`;
    }
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      slack: { variant: "secondary" as const, color: "bg-chart-2/10 text-chart-2" },
      teams: { variant: "secondary" as const, color: "bg-chart-1/10 text-chart-1" },
      discord: { variant: "secondary" as const, color: "bg-chart-3/10 text-chart-3" },
      zendesk: { variant: "secondary" as const, color: "bg-primary/10 text-primary" },
    };
    
    return badges[source as keyof typeof badges] || badges.slack;
  };

  return (
    <Card className="lg:col-span-2" data-testid="activity-feed">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Real-time Activity</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-chart-2 rounded-full pulse-slow"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {inquiries.length === 0 ? (
          <div className="text-center py-8" data-testid="activity-empty">
            <i className="fas fa-inbox text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          inquiries.map((inquiry: any, index: number) => (
            <div key={inquiry.id} className="flex items-start space-x-3" data-testid={`activity-item-${index}`}>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className={getActivityIcon(inquiry.status)}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground" data-testid={`activity-description-${index}`}>
                  {getActivityDescription(inquiry)}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-muted-foreground" data-testid={`activity-time-${index}`}>
                    {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                  </span>
                  <Badge 
                    variant={getSourceBadge(inquiry.source).variant}
                    className={`text-xs ${getSourceBadge(inquiry.source).color}`}
                    data-testid={`activity-source-${index}`}
                  >
                    {inquiry.source}
                  </Badge>
                  {inquiry.confidence && parseFloat(inquiry.confidence) > 0 && (
                    <span className="text-xs text-chart-2" data-testid={`activity-confidence-${index}`}>
                      {Math.round(parseFloat(inquiry.confidence) * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
