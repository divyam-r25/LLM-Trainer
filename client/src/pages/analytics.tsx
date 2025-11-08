import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { Activity, Zap, TrendingUp, Sparkles } from "lucide-react";
import type { PersonaWithStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: personas, isLoading } = useQuery<PersonaWithStats[]>({
    queryKey: ["/api/personas"],
  });

  const totalRequests = personas?.reduce((sum, p) => sum + (p.totalRequests || 0), 0) || 0;
  const totalTokens = personas?.reduce((sum, p) => sum + (p.totalTokens || 0), 0) || 0;
  const activePersonas = personas?.filter(p => p.isPublished).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track usage and performance metrics across your personas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Requests"
          value={totalRequests.toLocaleString()}
          icon={Activity}
          description="All-time API calls"
        />
        <StatCard
          title="Tokens Used"
          value={totalTokens.toLocaleString()}
          icon={Zap}
          description="Total consumption"
        />
        <StatCard
          title="Active Personas"
          value={activePersonas}
          icon={Sparkles}
          description="Currently published"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persona Breakdown</CardTitle>
          <CardDescription>
            Detailed metrics for each of your personas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Tokens Used</TableHead>
                  <TableHead className="text-right">API Keys</TableHead>
                  <TableHead className="text-right">Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((persona) => (
                  <TableRow key={persona.id} data-testid={`row-analytics-${persona.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {persona.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          persona.isPublished
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {persona.isPublished ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(persona.totalRequests || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {(persona.totalTokens || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {persona.apiKeyCount || 0}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      v{persona.currentVersion}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No personas found. Create your first persona to see analytics.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
