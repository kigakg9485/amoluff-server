import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntegrationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Integrations() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/integrations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Integration created",
        description: "The integration has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create integration.",
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/integrations/${id}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertIntegrationSchema),
    defaultValues: {
      name: "",
      type: "",
      config: {},
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

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
        return { variant: "secondary" as const, color: "bg-chart-2/10 text-chart-2" };
      case "pending":
        return { variant: "secondary" as const, color: "bg-chart-4/10 text-chart-4" };
      case "error":
        return { variant: "destructive" as const, color: "bg-destructive/10 text-destructive" };
      default:
        return { variant: "secondary" as const, color: "bg-muted/10 text-muted-foreground" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Header title="Integrations" description="Manage your platform integrations" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" data-testid="integrations-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Integrations" description="Manage your platform integrations" />
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Connected Integrations</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-integration">
                  <i className="fas fa-plus mr-2"></i>
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Integration Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Slack Workspace" {...field} data-testid="input-integration-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Integration Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-integration-type">
                                <SelectValue placeholder="Select integration type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="slack">Slack</SelectItem>
                              <SelectItem value="teams">Microsoft Teams</SelectItem>
                              <SelectItem value="discord">Discord</SelectItem>
                              <SelectItem value="zendesk">Zendesk</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-integration">
                        {createMutation.isPending ? "Creating..." : "Create Integration"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {integrations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <i className="fas fa-plug text-6xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No integrations configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first integration to connect with your team's tools.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-first-integration">
                    Add Your First Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              integrations.map((integration: any, index: number) => (
                <Card key={integration.id} data-testid={`integration-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className={`${getIntegrationIcon(integration.type)} text-2xl`}></i>
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`integration-name-${index}`}>
                            {integration.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground" data-testid={`integration-type-${index}`}>
                            {integration.type} integration
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={getStatusBadge(integration.status).variant}
                        className={getStatusBadge(integration.status).color}
                        data-testid={`integration-status-${index}`}
                      >
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {integration.lastSync ? (
                          <span data-testid={`integration-sync-${index}`}>
                            Last synced {formatDistanceToNow(new Date(integration.lastSync), { addSuffix: true })}
                          </span>
                        ) : (
                          <span>Never synced</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testMutation.mutate(integration.id)}
                          disabled={testMutation.isPending}
                          data-testid={`button-test-${index}`}
                        >
                          {testMutation.isPending ? "Testing..." : "Test"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-configure-${index}`}
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
