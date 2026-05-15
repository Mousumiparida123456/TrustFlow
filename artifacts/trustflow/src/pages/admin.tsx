import { AppLayout } from "@/components/layout/app-layout";
import { useGetAdminOverview, getGetAdminOverviewQueryKey, useListAdminUsers, getListAdminUsersQueryKey, useGetFraudHeatmap, getGetFraudHeatmapQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertTriangle, ShieldOff, Activity, Globe, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: overview } = useGetAdminOverview({
    query: { queryKey: getGetAdminOverviewQueryKey(), refetchInterval: 10000 }
  });

  const { data: users } = useListAdminUsers({
    query: { queryKey: getListAdminUsersQueryKey() }
  });

  const { data: heatmap } = useGetFraudHeatmap({
    query: { queryKey: getGetFraudHeatmapQueryKey() }
  });

  const riskData = overview ? [
    { name: 'Safe (0-30)', value: overview.riskDistribution.low, color: 'hsl(var(--primary))' },
    { name: 'Medium (31-60)', value: overview.riskDistribution.medium, color: 'hsl(var(--chart-3))' },
    { name: 'High (61-80)', value: overview.riskDistribution.high, color: 'hsl(var(--chart-4))' },
    { name: 'Critical (81-100)', value: overview.riskDistribution.critical, color: 'hsl(var(--destructive))' },
  ] : [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center">
            <Activity className="w-8 h-8 mr-3" />
            Security Operations Center
          </h1>
          <p className="text-muted-foreground font-mono mt-1 uppercase tracking-widest text-xs">Global Risk Overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase font-mono">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{overview?.activeUsers ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase font-mono">Fraud Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-amber-500">{overview?.fraudAlerts ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase font-mono">Blocked Sessions</CardTitle>
              <ShieldOff className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-destructive">{overview?.blockedSessions ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase font-mono">Avg Trust Score</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">{overview?.avgTrustScore.toFixed(1) ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm uppercase font-mono tracking-wider">System Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {overview ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground font-mono">Loading...</div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-sm uppercase font-mono tracking-wider">
                <Globe className="w-4 h-4 mr-2" />
                Regional Fraud Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border">
                      <TableHead className="font-mono text-xs uppercase">Region</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Country</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Fraud Attempts</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heatmap?.map((point, idx) => (
                      <TableRow key={idx} className="border-border">
                        <TableCell className="flex items-center font-medium">
                          <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                          {point.region}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{point.country}</TableCell>
                        <TableCell className="text-right font-mono">{point.fraudAttempts}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`
                            ${point.severity === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                              point.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              'bg-primary/10 text-primary border-primary/20'}
                          `}>
                            {point.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm uppercase font-mono tracking-wider">Active Monitored Users</CardTitle>
            <CardDescription>Real-time trust scores across all active sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="font-mono text-xs uppercase">User</TableHead>
                    <TableHead className="font-mono text-xs uppercase">Location</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Login Attempts</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Flagged Txs</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Current Trust</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id} className="border-border">
                      <TableCell>
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs text-muted-foreground">{u.device}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.location}</TableCell>
                      <TableCell className="text-right font-mono">{u.loginAttempts}</TableCell>
                      <TableCell className="text-right font-mono">
                        {u.flaggedTransactions > 0 ? (
                          <span className="text-amber-500">{u.flaggedTransactions}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono font-bold ${
                          u.trustScore > 60 ? 'text-destructive' : 
                          u.trustScore > 30 ? 'text-amber-500' : 'text-primary'
                        }`}>
                          {u.trustScore}/100
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
