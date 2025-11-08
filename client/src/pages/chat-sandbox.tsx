import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Persona, ChatRequest, ChatResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  tokensUsed?: number;
}

export default function ChatSandbox() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const { data: persona, isLoading } = useQuery<Persona>({
    queryKey: ["/api/personas", id],
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const request: ChatRequest = { message, personaId: id! };
      const response = await apiRequest("POST", "/api/chat", request);
      return await response.json() as ChatResponse;
    },
    onSuccess: (response, message) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        {
          role: "assistant",
          content: response.message,
          tokensUsed: response.tokensUsed,
        },
      ]);
      setInput("");
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to send message";
      
      if (error?.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = error.response.statusText || errorMessage;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (input.trim()) {
      sendMutation.mutate(input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!persona) {
    return <div>Persona not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-chat-title">
            Test: {persona.name}
          </h1>
          <p className="text-muted-foreground">{persona.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">Chat Sandbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12" data-testid="container-empty-chat">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Test your persona by sending messages. The AI will respond based on your training.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      data-testid={`message-${index}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.tokensUsed && (
                          <p className="text-xs mt-2 opacity-70">
                            {message.tokensUsed} tokens
                          </p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sendMutation.isPending && (
                    <div className="flex gap-3 justify-start" data-testid="message-loading">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="resize-none min-h-[60px]"
                  disabled={sendMutation.isPending}
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMutation.isPending}
                  size="icon"
                  className="h-[60px] w-[60px]"
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Persona Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Intent</div>
              <p className="text-sm">{persona.intent}</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Examples</div>
              <p className="text-sm font-mono">{persona.examples.length} provided</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Version</div>
              <p className="text-sm font-mono">v{persona.currentVersion}</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <p className="text-sm">{persona.isPublished ? "Published" : "Draft"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
