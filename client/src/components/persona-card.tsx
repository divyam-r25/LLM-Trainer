import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, Copy, Check, Rocket } from "lucide-react";
import type { PersonaWithStats } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PersonaCardProps {
  persona: PersonaWithStats;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyPersonaId = async () => {
    await navigator.clipboard.writeText(persona.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Persona ID copied to clipboard",
    });
  };

  return (
    <Card className="hover-elevate transition-all persona-glow-subtle" data-testid={`card-persona-${persona.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold truncate" data-testid={`text-persona-name-${persona.id}`}>
            {persona.name}
          </CardTitle>
          <CardDescription className="text-sm mt-1 line-clamp-2">
            {persona.description}
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-[#e6e8ed]" data-testid={`text-persona-id-${persona.id}`}>
              ID: {persona.id}
            </code>
            <button
              onClick={copyPersonaId}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Copy Persona ID"
              data-testid={`button-copy-id-${persona.id}`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <Badge variant={persona.isPublished ? "default" : "secondary"} data-testid={`badge-status-${persona.id}`}>
          {persona.isPublished ? "Published" : "Draft"}
        </Badge>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Requests</div>
            <div className="font-mono font-medium mt-1" data-testid={`text-requests-${persona.id}`}>
              {persona.totalRequests?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Tokens</div>
            <div className="font-mono font-medium mt-1" data-testid={`text-tokens-${persona.id}`}>
              {persona.totalTokens?.toLocaleString() || 0}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Version</div>
            <div className="font-mono font-medium mt-1" data-testid={`text-version-${persona.id}`}>
              v{persona.currentVersion}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1" data-testid={`button-test-${persona.id}`}>
          <Link href={`/personas/${persona.id}/test`}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Test
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${persona.id}`}>
          <Link href={`/personas/${persona.id}/edit`}>
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1" data-testid={`button-deploy-${persona.id}`}>
          <Link href={`/personas/${persona.id}/deploy`}>
            <Rocket className="w-4 h-4 mr-2" />
            Deploy
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
