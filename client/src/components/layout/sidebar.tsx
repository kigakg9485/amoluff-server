import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["/api/inquiries/pending"],
    select: (data: any[]) => data.length,
  });

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: "fas fa-chart-line",
      current: location === "/",
    },
    {
      name: "Integrations",
      href: "/integrations",
      icon: "fas fa-plug",
      current: location === "/integrations",
    },
    {
      name: "Knowledge Base",
      href: "/knowledge-base",
      icon: "fas fa-book",
      current: location === "/knowledge-base",
    },
    {
      name: "Workflows",
      href: "/workflows",
      icon: "fas fa-project-diagram",
      current: location === "/workflows",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: "fas fa-chart-bar",
      current: location === "/analytics",
    },
    {
      name: "Review Queue",
      href: "/review-queue",
      icon: "fas fa-tasks",
      current: location === "/review-queue",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm sidebar-transition" data-testid="sidebar">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8" data-testid="logo">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DataFlow AI</h1>
            <p className="text-xs text-muted-foreground">Inquiry Automation</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors",
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <i className={`${item.icon} w-5`}></i>
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs" data-testid="badge-pending">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        
        {/* Settings Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href="/settings"
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors",
              location === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            data-testid="nav-settings"
          >
            <i className="fas fa-cog w-5"></i>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
