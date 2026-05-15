import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Activity, CreditCard, LayoutDashboard, Settings, LogOut, Bell } from "lucide-react";
import { useGetTrustScore, getGetTrustScoreQueryKey } from "@workspace/api-client-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { session, logout } = useAuth();
  const [location] = useLocation();
  const sessionToken = session?.sessionToken || localStorage.getItem("trustflow_session");

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

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-primary";
    if (score <= 60) return "text-amber-500";
    return "text-destructive";
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Shield className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold tracking-tight text-lg">TrustFlow AI</span>
        </div>
        
        <div className="p-4 border-b border-border bg-card">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Active Session</div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{session?.username || 'user'}</span>
            {trustScoreData && (
              <span className={`font-mono font-bold ${getScoreColor(trustScoreData.trustScore)}`}>
                {trustScoreData.trustScore}/100
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <Link href="/dashboard" className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
          </Link>
          <Link href="/transactions" className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${location === '/transactions' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <CreditCard className="w-4 h-4 mr-3" /> Transactions
          </Link>
          
          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo / Admin</div>
          <Link href="/admin" className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${location === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <Activity className="w-4 h-4 mr-3" /> Operations Center
          </Link>
          <Link href="/alerts" className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${location === '/alerts' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <Bell className="w-4 h-4 mr-3" /> Fraud Alerts
          </Link>
          <Link href="/demo" className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${location === '/demo' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <Settings className="w-4 h-4 mr-3" /> Demo Mode
          </Link>
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/95 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center text-sm font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
            Behavioral monitoring active
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              ENCRYPTED_TCP
            </div>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
