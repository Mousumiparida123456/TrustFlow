import { AppLayout } from "@/components/layout/app-layout";
import { useListAlerts, getListAlertsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, ShieldAlert, Target, Shield, ScanFace } from "lucide-react";

export default function Alerts() {
  const { data: alerts, isLoading } = useListAlerts({
    query: { queryKey: getListAlertsQueryKey() }
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">HIGH</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">MEDIUM</Badge>;
      default:
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">LOW</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'impossible_travel': return <Globe className="w-4 h-4 text-amber-500" />;
      case 'new_device': return <ScanFace className="w-4 h-4 text-primary" />;
      case 'behavior_change': return <Target className="w-4 h-4 text-destructive" />;
      case 'high_risk_transaction': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'account_takeover': return <ShieldAlert className="w-4 h-4 text-destructive" />;
      default: return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  // Dummy Globe icon component since not imported in this scope but used in switch
  const Globe = ({className}: {className?: string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-destructive" />
            Fraud Alerts
          </h1>
          <p className="text-muted-foreground font-mono mt-1 uppercase tracking-widest text-xs">Actionable Security Intelligence</p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle>Global Alert Feed</CardTitle>
            <CardDescription>Live stream of behavioral anomalies and suspected fraud</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-primary font-mono animate-pulse">Scanning feed...</div>
            ) : !alerts || alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono">No alerts logged.</div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border">
                      <TableHead className="font-mono text-xs uppercase">Timestamp</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Target</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Anomaly Type</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Severity</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Details</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id} className={`border-border hover:bg-muted/20 ${!alert.isResolved && alert.severity === 'critical' ? 'bg-destructive/5' : ''}`}>
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(alert.timestamp), 'MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium font-mono">{alert.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs uppercase tracking-wider gap-2">
                            {getTypeIcon(alert.alertType)}
                            {alert.alertType.replace(/_/g, ' ')}
                          </div>
                        </TableCell>
                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={alert.description}>
                          {alert.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {alert.isResolved ? (
                            <span className="text-xs font-mono text-muted-foreground">RESOLVED</span>
                          ) : (
                            <span className="text-xs font-mono text-destructive animate-pulse">ACTIVE</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
