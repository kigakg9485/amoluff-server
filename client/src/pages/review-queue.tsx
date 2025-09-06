import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ReviewQueue() {
  const { toast } = useToast();

  const { data: pendingInquiries = [], isLoading } = useQuery({
    queryKey: ["/api/inquiries/pending"],
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const updateResponse = await apiRequest("PATCH", `/api/inquiries/${id}`, {
        status: "resolved",
        aiResponse: response,
        resolvedAt: new Date(),
      });
      return updateResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Inquiry resolved",
        description: "The inquiry has been marked as resolved.",
      });
    },
  });

  const getSourceBadge = (source: string) => {
    const badges = {
      slack: { color: "bg-chart-2/10 text-chart-2" },
      teams: { color: "bg-chart-1/10 text-chart-1" },
      discord: { color: "bg-chart-3/10 text-chart-3" },
      zendesk: { color: "bg-primary/10 text-primary" },
    };
    
    return badges[source as keyof typeof badges] || badges.slack;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Header title="Review Queue" description="Review and resolve escalated inquiries" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" data-testid="review-queue-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Review Queue" description="Review and resolve escalated inquiries" />
        
        <div className="p-6 space-y-6">
          {pendingInquiries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <i className="fas fa-check-circle text-6xl text-chart-2 mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No inquiries need manual review at the moment. Our AI is handling everything automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingInquiries.map((inquiry: any, index: number) => (
                <Card key={inquiry.id} data-testid={`inquiry-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant="secondary"
                            className={getSourceBadge(inquiry.source).color}
                            data-testid={`inquiry-source-${index}`}
                          >
                            {inquiry.source}
                          </Badge>
                          {inquiry.category && (
                            <Badge variant="outline" data-testid={`inquiry-category-${index}`}>
                              {inquiry.category}
                            </Badge>
                          )}
                          {inquiry.confidence && (
                            <span className="text-sm text-muted-foreground" data-testid={`inquiry-confidence-${index}`}>
                              {Math.round(parseFloat(inquiry.confidence) * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg" data-testid={`inquiry-user-${index}`}>
                          {inquiry.userDisplayName || inquiry.userId}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground" data-testid={`inquiry-time-${index}`}>
                          {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Original Inquiry:</h4>
                        <p className="text-muted-foreground p-3 bg-muted rounded-lg" data-testid={`inquiry-content-${index}`}>
                          {inquiry.content}
                        </p>
                      </div>
                      
                      {inquiry.aiResponse && (
                        <div>
                          <h4 className="font-semibold mb-2">AI Suggested Response:</h4>
                          <p className="text-muted-foreground p-3 bg-accent rounded-lg" data-testid={`inquiry-ai-response-${index}`}>
                            {inquiry.aiResponse}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline"
                          data-testid={`button-edit-response-${index}`}
                        >
                          Edit Response
                        </Button>
                        <Button
                          onClick={() => resolveMutation.mutate({ 
                            id: inquiry.id, 
                            response: inquiry.aiResponse || "Inquiry has been reviewed and resolved." 
                          })}
                          disabled={resolveMutation.isPending}
                          data-testid={`button-approve-${index}`}
                        >
                          {resolveMutation.isPending ? "Resolving..." : "Approve & Send"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
