import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin login status on component mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    if (adminLoggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/login', data);
      return response.json();
    },
    onSuccess: () => {
      // Save admin login status to localStorage
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      
      setIsLoggedIn(true);
      setLoginForm({ username: "", password: "" });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة التحكم",
      });
    },
    onError: (error: any) => {
      // Clear any existing admin session
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_login_time');
      
      toast({
        title: "فشل في تسجيل الدخول",
        description: error.message || "بيانات تسجيل الدخول غير صحيحة",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/logout', {});
      return response.json();
    },
    onSuccess: () => {
      // Clear admin login from localStorage
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_login_time');
      
      setIsLoggedIn(false);
      onClose();
      toast({
        title: "تم تسجيل الخروج",
        description: "شكراً لك",
      });
    },
  });

  const { data: applicationSettings } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/application-settings'],
    enabled: isLoggedIn && isOpen,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ type, isOpen }: { type: string; isOpen: boolean }) => {
      const response = await apiRequest('PUT', `/api/application-settings/${type}`, { isOpen });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/application-settings'] });
      toast({
        title: "تم تحديث الإعدادات",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في تحديث الإعدادات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleApplicationStatus = (type: string, currentStatus: boolean) => {
    updateSettingsMutation.mutate({ type, isOpen: !currentStatus });
  };

  const handleClose = () => {
    setIsLoggedIn(false);
    setLoginForm({ username: "", password: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isLoggedIn ? "لوحة تحكم الإدارة" : "تسجيل دخول الإدارة"}
          </DialogTitle>
        </DialogHeader>
        
        {!isLoggedIn ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="admin-username">اسم المستخدم</Label>
              <Input 
                id="admin-username"
                data-testid="input-admin-username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="text-right"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="admin-password">كلمة المرور</Label>
              <Input 
                id="admin-password"
                data-testid="input-admin-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="text-right"
                required
              />
            </div>
            
            <Button 
              type="submit"
              data-testid="button-admin-login"
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            {applicationSettings && (
              <div className="grid gap-6">
                {Object.entries(applicationSettings).map(([type, isOpen]) => {
                  const typeNames = {
                    admin: "تقديم الإدارة",
                    script: "نشر السكربتات", 
                    hacks: "نشر الهاكات"
                  };
                  
                  return (
                    <Card key={type}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{typeNames[type as keyof typeof typeNames]}</h4>
                            <p className="text-sm text-muted-foreground">
                              إدارة حالة تقديمات {typeNames[type as keyof typeof typeNames]}
                            </p>
                          </div>
                          <Button 
                            data-testid={`button-toggle-${type}`}
                            onClick={() => toggleApplicationStatus(type, isOpen)}
                            disabled={updateSettingsMutation.isPending}
                            variant={isOpen ? "destructive" : "default"}
                            className="text-sm"
                          >
                            {isOpen ? "إغلاق التقديم" : "فتح التقديم"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            
            <Button 
              data-testid="button-admin-logout"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {logoutMutation.isPending ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
