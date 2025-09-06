import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Add Knowledge Entry",
      icon: "fas fa-plus",
      action: () => setLocation("/knowledge-base"),
    },
    {
      title: "Configure Workflow",
      icon: "fas fa-cogs",
      action: () => setLocation("/workflows"),
    },
    {
      title: "View Analytics",
      icon: "fas fa-chart-bar",
      action: () => setLocation("/analytics"),
    },
    {
      title: "Manage Integrations",
      icon: "fas fa-plug",
      action: () => setLocation("/integrations"),
    },
  ];

  return (
    <Card data-testid="quick-actions">
      <CardHeader className="border-b border-border">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start space-x-3"
            onClick={action.action}
            data-testid={`quick-action-${index}`}
          >
            <i className={`${action.icon} text-primary`}></i>
            <span className="text-sm font-medium">{action.title}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
