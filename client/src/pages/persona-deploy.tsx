import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { Sparkles, Rocket, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Persona } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PersonaDeploy() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: persona, isLoading } = useQuery<Persona>({
    queryKey: ["/api/personas", id],
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/personas/${id}/publish`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      toast({
        title: "Success",
        description: "Persona published successfully",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/personas/${id}/unpublish`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personas", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/personas"] });
      toast({
        title: "Success",
        description: "Persona unpublished",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!persona) {
    return <div>Persona not found</div>;
  }

  const apiEndpoint = `${window.location.origin}/api/v1/chat/${persona.id}`;

  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "YOUR_API_KEY",
    "message": "Hello, how can you help me?"
  }'`;

  const jsExample = `const response = await fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: 'YOUR_API_KEY',
    message: 'Hello, how can you help me?'
  })
});

const data = await response.json();
console.log(data.message);`;

  const pythonExample = `import requests

url = "${apiEndpoint}"
data = {
    "apiKey": "YOUR_API_KEY",
    "message": "Hello, how can you help me?"
}

response = requests.post(url, json=data)
result = response.json()
print(result["message"])`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-deploy-title">
              Deploy: {persona.name}
            </h1>
            <p className="text-muted-foreground">{persona.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={persona.isPublished ? "default" : "secondary"} data-testid="badge-publish-status">
            {persona.isPublished ? "Published" : "Draft"}
          </Badge>
          {persona.isPublished ? (
            <Button
              variant="outline"
              onClick={() => unpublishMutation.mutate()}
              disabled={unpublishMutation.isPending}
              data-testid="button-unpublish"
            >
              <Globe className="w-4 h-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              data-testid="button-publish"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Publish to API
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
          <CardDescription>
            Use this endpoint to integrate your persona into applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted border border-border">
              <code className="text-sm font-mono break-all" data-testid="text-endpoint-url">
                {apiEndpoint}
              </code>
            </div>
            {!persona.isPublished && (
              <div className="p-4 rounded-md bg-muted border border-border text-sm text-muted-foreground">
                This persona needs to be published before the API endpoint becomes accessible.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>
            Code snippets to help you integrate this persona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript" data-testid="tab-javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python" data-testid="tab-python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="mt-4">
              <CodeBlock code={curlExample} language="bash" />
            </TabsContent>
            <TabsContent value="javascript" className="mt-4">
              <CodeBlock code={jsExample} language="javascript" />
            </TabsContent>
            <TabsContent value="python" className="mt-4">
              <CodeBlock code={pythonExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>
            Expected JSON response structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`{
  "message": "The AI persona's response to your message",
  "tokensUsed": 42
}`}
            language="json"
          />
        </CardContent>
      </Card>
    </div>
  );
}
