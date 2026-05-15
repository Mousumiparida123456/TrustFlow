import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetDemoScenarios, getGetDemoScenariosQueryKey, useSimulateScenario } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Target, Play, RotateCcw, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Progress } from "@/components/ui/progress";

export default function Demo() {
  const [step, setStep] = useState(0);
  const [activeScenario, setActiveScenario] = useState<"normal" | "attacker" | null>(null);
  
  const { data: scenarios } = useGetDemoScenarios({
    query: { queryKey: getGetDemoScenariosQueryKey() }
  });

  const simulateMutation = useSimulateScenario();

  const handleSimulate = async (scenario: "normal" | "attacker") => {
    setActiveScenario(scenario);
    try {
      await simulateMutation.mutateAsync({
        data: { scenario, step }
      });
      setStep(s => s + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setStep(0);
    setActiveScenario(null);
  };

  const currentNormal = scenarios?.normalUser.trustScoreTimeline.slice(0, step + 1) || [];
  const currentAttacker = scenarios?.attackerUser.trustScoreTimeline.slice(0, step + 1) || [];

  const renderScenarioCard = (
    title: string, 
    type: "normal" | "attacker", 
    data: typeof currentNormal,
    fullData: typeof scenarios.normalUser | undefined
  ) => {
    const isAttacker = type === "attacker";
    const currentScore = data.length > 0 ? data[data.length - 1].trustScore : 0;
    
    return (
      <Card className={`border-border bg-card shadow-lg relative overflow-hidden ${isAttacker && activeScenario === 'attacker' ? 'ring-1 ring-destructive' : ''}`}>
        {isAttacker && <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-32 h-32 text-destructive" /></div>}
        {!isAttacker && <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-32 h-32 text-primary" /></div>}
        
        <CardHeader>
          <CardTitle className={`flex items-center ${isAttacker ? 'text-destructive' : 'text-primary'}`}>
            {isAttacker ? <Target className="w-5 h-5 mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
            {title}
          </CardTitle>
          <CardDescription>{fullData?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-mono mb-1">Current Trust Score</div>
              <div className={`text-5xl font-mono font-bold ${currentScore > 60 ? 'text-destructive' : currentScore > 30 ? 'text-amber-500' : 'text-primary'}`}>
                {currentScore}
              </div>
            </div>
            <Button 
              variant={isAttacker ? "destructive" : "default"} 
              size="sm" 
              onClick={() => handleSimulate(type)}
              disabled={simulateMutation.isPending || (activeScenario !== null && activeScenario !== type) || step >= (fullData?.trustScoreTimeline.length || 0)}
              className="font-mono"
            >
              <Play className="w-4 h-4 mr-2" /> STEP
            </Button>
          </div>

          <div className="h-48 mt-4 border border-border rounded-md bg-background/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <YAxis domain={[0, 100]} hide />
                <ReferenceLine y={30} stroke="hsl(var(--primary))" strokeOpacity={0.3} strokeDasharray="3 3" />
                <ReferenceLine y={60} stroke="hsl(var(--destructive))" strokeOpacity={0.3} strokeDasharray="3 3" />
                <Line 
                  type="stepAfter" 
                  dataKey="trustScore" 
                  stroke={isAttacker ? "hsl(var(--destructive))" : "hsl(var(--primary))"} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: isAttacker ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} 
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-muted/30 border border-border rounded text-sm min-h-[80px]">
             <div className="font-mono text-xs text-muted-foreground mb-1 uppercase">Event Log</div>
             {simulateMutation.data && activeScenario === type && (
               <div className="animate-in fade-in slide-in-from-left-2">
                 <div className="font-medium">{simulateMutation.data.event}</div>
                 <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-background rounded border border-border font-mono">
                      Action: <span className={simulateMutation.data.action === 'block' ? 'text-destructive' : 'text-primary'}>
                        {simulateMutation.data.action.toUpperCase()}
                      </span>
                    </span>
                 </div>
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fraud Replay Simulation</h1>
            <p className="text-muted-foreground font-mono mt-1 uppercase text-xs tracking-widest">Compare normal behavior against credential stuffing</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="font-mono">
            <RotateCcw className="w-4 h-4 mr-2" /> RESET SIMULATION
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {scenarios && renderScenarioCard("Genuine User", "normal", currentNormal, scenarios.normalUser)}
          {scenarios && renderScenarioCard("Attacker (Stolen Credentials)", "attacker", currentAttacker, scenarios.attackerUser)}
        </div>
        
        {activeScenario === 'attacker' && step > 2 && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h4 className="font-bold text-destructive font-mono uppercase tracking-wider">Zero-Day Prevention Active</h4>
              <p className="text-sm text-foreground/80 mt-1">
                The attacker has the correct password, but the TrustScore immediately flagged the abnormal typing cadence and mouse velocity. The transaction was blocked without relying on a password alone.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
