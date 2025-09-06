import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border p-6" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="page-title">{title}</h2>
          {description && (
            <p className="text-muted-foreground" data-testid="page-description">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="notifications-button"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="notification-count">
              2
            </span>
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3" data-testid="user-menu">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground" data-testid="user-name">Sarah Chen</p>
              <p className="text-xs text-muted-foreground" data-testid="user-role">Data Team Lead</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-1 rounded-full flex items-center justify-center" data-testid="user-avatar">
              <span className="text-primary-foreground font-semibold">SC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
