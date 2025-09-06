import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VerificationFormProps {
  onSuccess: () => void;
}

export default function VerificationForm({ onSuccess }: VerificationFormProps) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  // Check if user is already verified on component mount
  useEffect(() => {
    const isVerified = localStorage.getItem('discord_verified');
    const savedUsername = localStorage.getItem('discord_username');
    if (isVerified === 'true' && savedUsername) {
      onSuccess();
    }
  }, [onSuccess]);

  const verificationMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      const response = await apiRequest('POST', '/api/verify-discord', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Save verification status to localStorage
      localStorage.setItem('discord_verified', 'true');
      localStorage.setItem('discord_username', username.trim());
      localStorage.setItem('discord_userId', data.userId || 'test-user-id');
      
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في نظام التقديمات",
      });
      onSuccess();
    },
    onError: (error: any) => {
      // Clear any existing verification
      localStorage.removeItem('discord_verified');
      localStorage.removeItem('discord_username');
      localStorage.removeItem('discord_userId');
      
      toast({
        title: "فشل في التحقق",
        description: error.message || "المستخدم غير موجود في السيرفر",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    verificationMutation.mutate({ username: username.trim() });
  };

  return (
    <section className="max-w-md mx-auto">
      <Card className="shadow-xl border border-border slide-in glass-effect pulse-glow">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 discord-gradient rounded-full mx-auto mb-4 flex items-center justify-center float-animation">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a5 5 0 1 0 5 5a5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3a3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h18z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">التحقق من العضوية</h2>
            <p className="text-muted-foreground">أدخل اسم المستخدم في Discord للتحقق من عضويتك في السيرفر</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="discord-username" className="block text-sm font-medium mb-2">
                اسم المستخدم في Discord
              </Label>
              <Input 
                id="discord-username"
                data-testid="input-discord-username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: username#1234"
                className="text-right"
                required
              />
            </div>
            
            <Button 
              type="submit"
              data-testid="button-verify"
              disabled={verificationMutation.isPending}
              className="w-full discord-gradient text-white transition-all duration-300 smooth-scale glow-effect relative overflow-hidden"
            >
              {verificationMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <span>جاري التحقق...</span>
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                "التحقق من العضوية"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
