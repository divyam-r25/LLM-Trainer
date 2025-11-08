import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, User, Bot, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Persona, ChatRequest, ChatResponse, ChatMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AIThinkingLoader } from "@/components/ai-thinking-loader";
import { AnimatePresence } from "framer-motion";

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
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: persona, isLoading } = useQuery<Persona>({
    queryKey: ["/api/personas", id],
  });

  useEffect(() => {
    if (!id) return;
    
    const storageKey = `chat-session-${id}`;
    let storedSessionId = localStorage.getItem(storageKey);
    
    if (!storedSessionId) {
      storedSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(storageKey, storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, [id]);

  useEffect(() => {
    if (!id || !sessionId) return;

    const loadChatHistory = async () => {
      try {
        const response = await fetch(`/api/chat/${id}/history?sessionId=${sessionId}`);
        if (response.ok) {
          const history: ChatMessage[] = await response.json();
          const formattedMessages = history.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [id, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const request: ChatRequest = { message, personaId: id!, sessionId };
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
    onError: (error: any) => {
      let errorMessage = "Failed to send message";
      
      if (error?.message) {
        const match = error.message.match(/:\s*({.*})/);
        if (match) {
          try {
            const errorData = JSON.parse(match[1]);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        } else {
          errorMessage = error.message.replace(/^\d+:\s*/, '');
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/chat/${id}/clear?sessionId=${sessionId}`);
      return response;
    },
    onSuccess: () => {
      setMessages([]);
      toast({
        title: "Chat Cleared",
        description: "Conversation history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
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
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-lg">Chat Sandbox</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearChatMutation.mutate()}
              disabled={messages.length === 0 || clearChatMutation.isPending}
              data-testid="button-clear-chat"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-6">
              <div className="space-y-4">
                {messages.length === 0 && !sendMutation.isPending && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12" data-testid="container-empty-chat">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Test your persona by sending messages. The AI will respond based on your training.
                    </p>
                  </div>
                )}
                
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
                      {message.role === "user" ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
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
                
                <AnimatePresence>
                  {sendMutation.isPending && (
                    <div key="ai-thinking" className="flex w-full my-4">
                      <AIThinkingLoader />
                    </div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
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
