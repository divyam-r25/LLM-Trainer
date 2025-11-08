import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Copy, Check, Trash2, RefreshCw, Power, Code } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ApiKey, Persona, InsertApiKey } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiKeys() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const { data: apiKeys, isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/api-keys"],
  });

  const { data: personas } = useQuery<Persona[]>({
    queryKey: ["/api/personas"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: InsertApiKey) => {
      const response = await apiRequest("POST", "/api/api-keys", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setIsDialogOpen(false);
      setKeyName("");
      setSelectedPersonaId("");
      setNewlyCreatedKey(data.plainTextKey);
      setShowKeyDialog(true);
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/api-keys/${id}/regenerate`, undefined);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      setNewlyCreatedKey(data.plainTextKey);
      setShowKeyDialog(true);
      toast({
        title: "Success",
        description: "API key regenerated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive",
      });
    },
  });

  const toggleKeyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/api-keys/${id}/toggle`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/api-keys/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
  });

  const handleCreate = () => {
    if (keyName && selectedPersonaId) {
      createKeyMutation.mutate({
        name: keyName,
        personaId: selectedPersonaId,
      });
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const baseUrl = window.location.origin;

  const curlExample = `curl -X POST ${baseUrl}/api/v1/chat/YOUR_PERSONA_ID \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can you help me?"
  }'`;

  const jsExample = `const response = await fetch('${baseUrl}/api/v1/chat/YOUR_PERSONA_ID', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?'
  })
});

const data = await response.json();
console.log(data.message); // AI response
console.log(data.tokensUsed); // Tokens consumed`;

  const pythonExample = `import requests

url = "${baseUrl}/api/v1/chat/YOUR_PERSONA_ID"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "message": "Hello, how can you help me?"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result["message"])
print(f"Tokens used: {result['tokensUsed']}")`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-api-keys-title">
            API Keys
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys for accessing your personas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-api-key">
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key to access a specific persona
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  data-testid="input-key-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona">Persona</Label>
                <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                  <SelectTrigger id="persona" data-testid="select-persona">
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas?.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!keyName || !selectedPersonaId || createKeyMutation.isPending}
                data-testid="button-confirm-create"
              >
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            <CardTitle>How to Use Your API Keys</CardTitle>
          </div>
          <CardDescription>
            API endpoint format and integration examples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Endpoint Format</h3>
              <div className="p-4 rounded-md bg-muted border border-border">
                <code className="text-sm font-mono break-all">
                  POST {baseUrl}/api/v1/chat/&#123;PERSONA_ID&#125;
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <div className="p-4 rounded-md bg-muted border border-border">
                <code className="text-sm font-mono">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Request Format</h3>
              <CodeBlock
                code={`{
  "message": "Your message to the AI persona"
}`}
                language="json"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Response Format</h3>
              <CodeBlock
                code={`{
  "message": "The AI persona's response",
  "tokensUsed": 42
}`}
                language="json"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Integration Examples</h3>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
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
          </div>

          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              <strong>Important:</strong> Replace YOUR_PERSONA_ID with your persona's ID (found in the Deploy page) and YOUR_API_KEY with an API key from the table below. Rate limit: 60 requests/minute per key.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy this key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <Key className="w-4 h-4" />
              <AlertDescription>
                <div className="mt-2">
                  <code className="block text-xs font-mono bg-muted p-3 rounded break-all">
                    {newlyCreatedKey}
                  </code>
                </div>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (newlyCreatedKey) {
                  copyKey(newlyCreatedKey);
                }
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Key
            </Button>
            <Button onClick={() => setShowKeyDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate requests to your persona endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => {
                  const persona = personas?.find((p) => p.id === apiKey.personaId);
                  return (
                    <TableRow key={apiKey.id} data-testid={`row-api-key-${apiKey.id}`}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>{persona?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {apiKey.lastUsedAt
                          ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateKeyMutation.mutate(apiKey.id)}
                            title="Regenerate key"
                            data-testid={`button-regenerate-${apiKey.id}`}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyMutation.mutate({ id: apiKey.id, isActive: !apiKey.isActive })}
                            title={apiKey.isActive ? "Disable key" : "Enable key"}
                            data-testid={`button-toggle-${apiKey.id}`}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteKeyMutation.mutate(apiKey.id)}
                            title="Delete key"
                            data-testid={`button-delete-${apiKey.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Key}
              title="No API keys yet"
              description="Create your first API key to start accessing your personas programmatically"
              actionLabel="Create First API Key"
              onAction={() => setIsDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
