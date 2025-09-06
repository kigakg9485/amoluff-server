import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertKnowledgeEntrySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

export default function KnowledgeBase() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/knowledge"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/knowledge", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Knowledge entry created",
        description: "The knowledge entry has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create knowledge entry.",
        variant: "destructive",
      });
    },
  });

  const enhanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/knowledge/enhance", data);
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("title", data.enhancedTitle);
      form.setValue("content", data.enhancedContent);
      if (data.suggestedTags.length > 0) {
        form.setValue("tags", data.suggestedTags);
      }
      toast({
        title: "Content enhanced",
        description: "AI has improved your knowledge entry content.",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertKnowledgeEntrySchema.extend({
      tags: insertKnowledgeEntrySchema.shape.tags.optional(),
    })),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: [],
      createdBy: "current-user-id", // This would come from auth context
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEnhance = () => {
    const title = form.getValues("title");
    const content = form.getValues("content");
    const category = form.getValues("category");
    
    if (title && content && category) {
      enhanceMutation.mutate({ title, content, category });
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in title, content, and category before enhancing.",
        variant: "destructive",
      });
    }
  };

  const filteredEntries = entries.filter((entry: any) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(entries.map((entry: any) => entry.category)));

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Header title="Knowledge Base" description="Manage your AI knowledge base entries" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" data-testid="knowledge-base-page">
      <Sidebar />
      
      <main className="flex-1">
        <Header title="Knowledge Base" description="Manage your AI knowledge base entries" />
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="input-search-knowledge"
                />
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-knowledge">
                  <i className="fas fa-plus mr-2"></i>
                  Add Knowledge Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Knowledge Entry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., How to request data warehouse access" {...field} data-testid="input-knowledge-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-knowledge-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Data Access">Data Access</SelectItem>
                              <SelectItem value="Pipeline Issues">Pipeline Issues</SelectItem>
                              <SelectItem value="Report Generation">Report Generation</SelectItem>
                              <SelectItem value="Schema Questions">Schema Questions</SelectItem>
                              <SelectItem value="Performance">Performance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed information and step-by-step instructions..."
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-knowledge-content"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEnhance}
                        disabled={enhanceMutation.isPending}
                        data-testid="button-enhance-content"
                      >
                        <i className="fas fa-magic mr-2"></i>
                        {enhanceMutation.isPending ? "Enhancing..." : "Enhance with AI"}
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-knowledge">
                          {createMutation.isPending ? "Creating..." : "Create Entry"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={searchQuery === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchQuery("")}
              data-testid="filter-all"
            >
              All ({entries.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(category)}
                data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category} ({entries.filter((e: any) => e.category === category).length})
              </Button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <i className="fas fa-book text-6xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "No matching entries found" : "No knowledge entries yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms or browse all categories."
                      : "Start building your knowledge base by adding your first entry."
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-first-knowledge">
                      Add Your First Entry
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry: any, index: number) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow" data-testid={`knowledge-card-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2" data-testid={`knowledge-title-${index}`}>
                          {entry.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" data-testid={`knowledge-category-${index}`}>
                            {entry.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground" data-testid={`knowledge-usage-${index}`}>
                            Used {entry.usageCount} times
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`knowledge-content-${index}`}>
                      {entry.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span data-testid={`knowledge-updated-${index}`}>
                        Updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`button-edit-${index}`}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-delete-${index}`}>
                          Delete
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
