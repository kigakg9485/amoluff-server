import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Code, Lock } from "lucide-react";

interface ApplicationCardsProps {
  applicationSettings?: Record<string, boolean>;
}

export default function ApplicationCards({ applicationSettings }: ApplicationCardsProps) {
  const handleApplicationClick = (type: string) => {
    const event = new CustomEvent('openApplicationModal', { detail: { type } });
    window.dispatchEvent(event);
  };

  const isApplicationOpen = (type: string) => {
    return applicationSettings?.[type] ?? true;
  };

  const applications = [
    {
      type: 'admin',
      title: 'تقديم الإدارة',
      description: 'انضم إلى فريق الإدارة وساعد في تطوير السيرفر',
      icon: Shield,
      color: 'primary',
    },
    {
      type: 'script',
      title: 'نشر السكربتات',
      description: 'شارك سكربتاتك المميزة مع مجتمع السيرفر',
      icon: Code,
      color: 'accent',
    },
    {
      type: 'hacks',
      title: 'نشر الهاكات',
      description: 'شارك أدوات التطوير والهاكات المفيدة',
      icon: Lock,
      color: 'destructive',
    },
  ];

  return (
    <section className="slide-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 bounce-in">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent neon-text">
            نظام التقديمات amoluff
          </h2>
          <p className="text-muted-foreground text-lg opacity-90">اختر نوع التقديم المناسب لك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {applications.map(({ type, title, description, icon: Icon, color }) => {
            const isOpen = isApplicationOpen(type);
            
            return (
              <div key={type} className="bg-card rounded-lg p-6 border border-border glass-effect stagger-animation card-hover" style={{animationDelay: `${applications.indexOf(applications.find(app => app.type === type)!) * 0.1}s`}}>
                <div className="text-center">
                  <div className={`w-12 h-12 bg-${color}/20 rounded-full mx-auto mb-4 flex items-center justify-center float-animation`}>
                    <Icon className={`w-6 h-6 text-${color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{description}</p>
                  <div className="mb-4">
                    <Badge 
                      variant={isOpen ? "default" : "destructive"}
                      data-testid={`status-${type}`}
                      className={isOpen ? "bg-accent/20 text-accent" : ""}
                    >
                      {isOpen ? "التقديم مفتوح" : "التقديم مغلق"}
                    </Badge>
                  </div>
                  <Button 
                    data-testid={`button-apply-${type}`}
                    onClick={() => handleApplicationClick(type)}
                    disabled={!isOpen}
                    className={`w-full transition-all duration-300 ${isOpen ? 'discord-gradient text-white smooth-scale glow-effect' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    تقديم الآن
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
