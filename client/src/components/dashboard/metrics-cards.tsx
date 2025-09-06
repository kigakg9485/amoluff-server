import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Inquiries Today",
      value: metrics?.totalInquiriesToday || 0,
      change: "+12%",
      changeType: "increase",
      icon: "fas fa-comments",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Auto-Resolved",
      value: metrics?.autoResolvedToday || 0,
      change: `${Math.round(((metrics?.autoResolvedToday || 0) / Math.max(metrics?.totalInquiriesToday || 1, 1)) * 100)}%`,
      changeType: "increase",
      icon: "fas fa-robot",
      color: "bg-chart-2/10 text-chart-2",
    },
    {
      title: "Avg Response Time",
      value: `${metrics?.avgResponseTime?.toFixed(1) || 0}s`,
      change: "-15%",
      changeType: "decrease",
      icon: "fas fa-clock",
      color: "bg-chart-4/10 text-chart-4",
    },
    {
      title: "Satisfaction Score",
      value: metrics?.satisfactionScore?.toFixed(1) || "0.0",
      change: "234 ratings",
      changeType: "neutral",
      icon: "fas fa-heart",
      color: "bg-chart-1/10 text-chart-1",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover-scale shadow-sm" data-testid={`metric-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium" data-testid={`metric-title-${index}`}>
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-foreground" data-testid={`metric-value-${index}`}>
                  {card.value}
                </p>
                <p className="text-xs text-chart-2 flex items-center mt-1" data-testid={`metric-change-${index}`}>
                  {card.changeType === "increase" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {card.changeType === "decrease" && <TrendingDown className="w-3 h-3 mr-1" />}
                  <span>{card.change}</span>
                  {card.changeType !== "neutral" && " from yesterday"}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} text-xl`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
