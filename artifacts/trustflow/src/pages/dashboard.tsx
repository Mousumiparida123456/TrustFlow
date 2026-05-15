import { useState } from "react";
import { useGetTrustScore, getGetTrustScoreQueryKey, useListTransactions, getListTransactionsQueryKey, useCreateTransaction, useGetTrustHistory, getGetTrustHistoryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { useBehaviorTracking } from "@/hooks/use-behavior-tracking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRightLeft, ShieldAlert, ShieldCheck, Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { session } = useAuth();
  useBehaviorTracking();
  const sessionToken = session?.sessionToken;

  const { data: trustScoreData } = useGetTrustScore({
    query: {
      enabled: !!sessionToken,
      queryKey: getGetTrustScoreQueryKey(),
      refetchInterval: 5000,
    },
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const { data: transactions } = useListTransactions({
    query: {
      enabled: !!sessionToken,
      queryKey: getListTransactionsQueryKey(),
    },
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const { data: history } = useGetTrustHistory({
    query: {
      enabled: !!sessionToken,
      queryKey: getGetTrustHistoryQueryKey(),
    },
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const score = trustScoreData?.trustScore ?? 0;
  const isSafe = score <= 30;
  const isMedium = score > 30 && score <= 60;
  const isHigh = score > 60;

  const getScoreColor = () => {
    if (isSafe) return "text-primary";
    if (isMedium) return "text-amber-500";
    return "text-destructive";
  };

  const getProgressColorClass = () => {
    if (isSafe) return "bg-primary";
    if (isMedium) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
            <p className="text-muted-foreground font-mono mt-1">Session ID: {sessionToken?.substring(0, 8)}... Active Monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 border-border bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Live Trust Score
              </CardTitle>
              <CardDescription>Real-time behavioral risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className={`text-6xl font-bold font-mono tracking-tighter ${getScoreColor()}`}>
                    {score}
                  </span>
                  <span className="text-sm text-muted-foreground uppercase tracking-widest mt-1">
                    Risk Level: {trustScoreData?.riskLevel || 'UNKNOWN'}
                  </span>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center relative">
                  {isSafe && <ShieldCheck className="w-12 h-12 text-primary" />}
                  {isMedium && <AlertTriangle className="w-12 h-12 text-amber-500" />}
                  {isHigh && <ShieldAlert className="w-12 h-12 text-destructive" />}
                  
                  {/* Radar sweep effect */}
                  <div className="absolute inset-0 rounded-full bg-primary/5 animate-[spin_3s_linear_infinite]" style={{ borderRight: '2px solid hsl(var(--primary))' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-muted-foreground">
                  <span>0 (Safe)</span>
                  <span>100 (Critical)</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${getProgressColorClass()}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {history && history.length > 0 && (
                <div className="h-32 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <Line type="monotone" dataKey="trustScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-sm uppercase tracking-wider text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {!trustScoreData?.riskFactors || trustScoreData.riskFactors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <ShieldCheck className="w-12 h-12 text-primary/50" />
                  <p className="text-sm font-mono">No significant risk factors detected.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trustScoreData.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-start p-3 rounded-lg bg-muted/50 border border-border">
                      {factor.severity === 'high' ? (
                        <AlertCircle className="w-5 h-5 text-destructive mr-3 mt-0.5 shrink-0" />
                      ) : factor.severity === 'medium' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                      ) : (
                        <Activity className="w-5 h-5 text-primary mr-3 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">{factor.factor}</div>
                        <div className="text-xs text-muted-foreground mt-1">{factor.description}</div>
                        <div className="text-xs font-mono mt-2 text-primary opacity-80">+{factor.contribution} to risk score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="font-mono text-xs" asChild>
              <a href="/transactions">VIEW ALL</a>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                No recent transactions found.
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4">
                        <ArrowRightLeft className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold">{tx.beneficiary}</div>
                        <div className="text-xs text-muted-foreground uppercase">{tx.transactionType} • {format(new Date(tx.timestamp), 'MMM dd, HH:mm')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold">${tx.amount.toFixed(2)}</div>
                        <div className={`text-xs font-mono uppercase ${
                          tx.status === 'completed' ? 'text-green-500' :
                          tx.status === 'flagged' ? 'text-amber-500' : 'text-destructive'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
