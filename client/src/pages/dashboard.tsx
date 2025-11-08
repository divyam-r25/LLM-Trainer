import { useQuery } from "@tanstack/react-query";
import { PersonaCard } from "@/components/persona-card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Sparkles, Activity, Zap, Plus } from "lucide-react";
import { Link } from "wouter";
import type { PersonaWithStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { data: personas, isLoading } = useQuery<PersonaWithStats[]>({
    queryKey: ["/api/personas"],
  });

  const totalPersonas = personas?.length || 0;
  const totalRequests = personas?.reduce((sum, p) => sum + (p.totalRequests || 0), 0) || 0;
  const totalTokens = personas?.reduce((sum, p) => sum + (p.totalTokens || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Train, test, and deploy your AI personas
          </p>
        </div>
        <Button asChild data-testid="button-create-persona">
          <Link href="/personas/new">
            <Plus className="w-4 h-4 mr-2" />
            New Persona
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Personas"
          value={totalPersonas}
          icon={Sparkles}
          description={`${personas?.filter(p => p.isPublished).length || 0} published`}
        />
        <StatCard
          title="API Requests"
          value={totalRequests.toLocaleString()}
          icon={Activity}
          description="Across all personas"
        />
        <StatCard
          title="Tokens Used"
          value={totalTokens.toLocaleString()}
          icon={Zap}
          description="Total consumption"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Personas</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : personas && personas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No personas yet"
            description="Create your first AI persona to get started. Define its behavior with intent and examples."
            actionLabel="Create First Persona"
            onAction={() => window.location.href = "/personas/new"}
          />
        )}
      </div>
    </div>
  );
}
