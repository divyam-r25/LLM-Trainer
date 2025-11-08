import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertPersonaSchema, type InsertPersona, type Persona } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, X, Save, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useParams } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { AILoadingSpinner } from "@/components/ai-loading-spinner";

export default function PersonaForm() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = id && id !== "new";

  const { data: persona, isLoading } = useQuery<Persona>({
    queryKey: ["/api/personas", id],
    enabled: !!isEdit,
  });

  const form = useForm<InsertPersona>({
    resolver: zodResolver(insertPersonaSchema),
    defaultValues: {
      name: "",
      description: "",
      intent: "",
      examples: [],
      systemPrompt: "",
      isPublished: 0,
      currentVersion: 1,
    },
  });

  const [examples, setExamples] = useState<Array<{ input: string; output: string }>>([]);
  const [currentExample, setCurrentExample] = useState({ input: "", output: "" });

  // Handle query params from trial section (homepage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get("name");
    const intentParam = urlParams.get("intent");
    const exampleParam = urlParams.get("example");

    if (nameParam || intentParam) {
      form.setValue("name", nameParam || "");
      form.setValue("intent", intentParam || "");
      
      if (exampleParam) {
        const exampleLines = exampleParam.split("\n");
        if (exampleLines.length >= 2) {
          setCurrentExample({
            input: exampleLines[0].replace(/^User:\s*/i, ""),
            output: exampleLines[1].replace(/^(Bot|Assistant):\s*/i, ""),
          });
        }
      }
    }
  }, [form]);

  useEffect(() => {
    if (persona) {
      form.reset({
        name: persona.name,
        description: persona.description,
        intent: persona.intent,
        examples: persona.examples,
        systemPrompt: persona.systemPrompt,
        isPublished: persona.isPublished,
        currentVersion: persona.currentVersion,
      });
      setExamples(persona.examples);
    }
  }, [persona, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertPersona) => {
      const response = await apiRequest("POST", "/api/personas", data);
      return await response.json();
    },
    onSuccess: (persona) => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      toast({
        title: "Success",
        description: "Persona created successfully! Redirecting to chat sandbox...",
      });
      setLocation(`/personas/${persona.id}/test`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create persona",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertPersona) => {
      const response = await apiRequest("PATCH", `/api/personas/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personas", id] });
      toast({
        title: "Success",
        description: "Persona updated successfully",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update persona",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/personas/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete persona");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      toast({
        title: "Success",
        description: "Persona deleted successfully",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete persona",
        variant: "destructive",
      });
    },
  });

  const addExample = () => {
    if (currentExample.input.trim() && currentExample.output.trim()) {
      const newExamples = [...examples, currentExample];
      setExamples(newExamples);
      form.setValue("examples", newExamples);
      setCurrentExample({ input: "", output: "" });
    }
  };

  const removeExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    setExamples(newExamples);
    form.setValue("examples", newExamples);
  };

  const onSubmit = (data: InsertPersona) => {
    const submitData = {
      ...data,
      examples,
      systemPrompt: data.systemPrompt || `You are ${data.name}. ${data.intent}`,
    };

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isPending && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
            <AILoadingSpinner 
              size="lg" 
              message={isEdit ? "Updating your persona..." : "Creating your AI persona..."}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-form-title">
            {isEdit ? "Edit Persona" : "Create New Persona"}
          </h1>
          <p className="text-muted-foreground">
            Define your AI persona's behavior and personality
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Give your persona a name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Customer Support Bot"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of what this persona does"
                        className="resize-none"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training</CardTitle>
              <CardDescription>
                Define the persona's behavior through intent and examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="intent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intent</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the persona's purpose and how it should behave..."
                        className="min-h-24 resize-none"
                        {...field}
                        data-testid="input-intent"
                      />
                    </FormControl>
                    <FormDescription>
                      This guides how your AI persona responds to users
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Few-Shot Examples (Optional)</FormLabel>
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-md border border-border bg-muted/50 space-y-2"
                      data-testid={`example-${index}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">User:</div>
                            <div className="text-sm">{example.input}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Assistant:</div>
                            <div className="text-sm">{example.output}</div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExample(index)}
                          data-testid={`button-remove-example-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-4 rounded-md border border-border">
                  <Input
                    placeholder="User input example..."
                    value={currentExample.input}
                    onChange={(e) =>
                      setCurrentExample({ ...currentExample, input: e.target.value })
                    }
                    data-testid="input-example-input"
                  />
                  <Textarea
                    placeholder="Expected assistant response..."
                    value={currentExample.output}
                    onChange={(e) =>
                      setCurrentExample({ ...currentExample, output: e.target.value })
                    }
                    className="resize-none"
                    data-testid="input-example-output"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExample}
                    disabled={!currentExample.input.trim() || !currentExample.output.trim()}
                    data-testid="button-add-example"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-between">
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    data-testid="button-delete"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Persona</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{persona?.name}"? This action cannot be undone.
                      All associated data, including API keys and analytics, will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="button-delete-confirm"
                    >
                      Delete Persona
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Persona" : "Create Persona"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
