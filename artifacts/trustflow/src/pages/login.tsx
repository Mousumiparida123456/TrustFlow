import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useVerifyOtp } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useBehaviorTracking } from "@/hooks/use-behavior-tracking";
import { Shield, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthSession } = useAuth();
  
  const [step, setStep] = useState<"login" | "otp" | "blocked">("login");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [blockMessage, setBlockMessage] = useState("");

  useBehaviorTracking(); // Track even on login

  const loginMutation = useLogin();
  const otpMutation = useVerifyOtp();

  const demoUsers = [
    { username: "alice_johnson", risk: "low" },
    { username: "bob_smith", risk: "medium" },
    { username: "carol_white", risk: "high" },
    { username: "eve_attacker", risk: "critical" },
  ];

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "alice_johnson",
      password: "demo123",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const result = await loginMutation.mutateAsync({ data });
      if (result.status === "success" && result.sessionToken) {
        setAuthSession(result.sessionToken);
        setLocation("/dashboard");
      } else if (result.status === "otp_required" && result.sessionToken) {
        setTempToken(result.sessionToken);
        setStep("otp");
      } else if (result.status === "blocked") {
        setBlockMessage(result.message);
        setStep("blocked");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    if (!tempToken) return;
    try {
      const result = await otpMutation.mutateAsync({
        data: { sessionToken: tempToken, otp: data.otp },
      });
      setAuthSession(result.sessionToken);
      setLocation("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background grid and glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl relative z-10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
        
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-inner">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1">TrustFlow Secure</h1>
            <p className="text-muted-foreground text-sm font-mono">Military-grade identity validation</p>
          </div>

          {step === "login" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} className="font-mono bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="font-mono bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-6" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  AUTHENTICATE
                </Button>
                {loginMutation.isError && (
                  <div className="p-3 mt-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
                    <span>Authentication failed. Check credentials.</span>
                  </div>
                )}
              </form>
            </Form>
          )}

          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <div className="text-center text-sm mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Step-up Verification</h3>
                  <p className="text-muted-foreground mt-1">
                    Unusual behavior detected. Enter the 6-digit code sent to your device.
                  </p>
                </div>
                
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={otpMutation.isPending}>
                  {otpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  VERIFY CODE
                </Button>
              </form>
            </Form>
          )}

          {step === "blocked" && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-destructive mb-2">ACCESS BLOCKED</h2>
              <p className="text-muted-foreground mb-8">{blockMessage || "High risk behavior detected. Account frozen for your protection."}</p>
              <Button variant="outline" className="w-full" onClick={() => setStep("login")}>
                RETURN TO LOGIN
              </Button>
            </div>
          )}
        </div>
        
        <div className="bg-muted px-8 py-3 flex justify-between items-center border-t border-border">
          <span className="text-xs font-mono text-muted-foreground flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-2"></span>
            System Online
          </span>
          <span className="text-xs font-mono text-muted-foreground">v0.1.0</span>
        </div>
      </div>

      {/* Demo credentials panel */}
      {step === "login" && (
        <div className="w-full max-w-md mt-4 bg-card/60 border border-border rounded-xl p-4 relative z-10">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Demo Accounts — click to fill</p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((u) => {
              const colors: Record<string, string> = {
                low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                medium: "text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
                high: "text-orange-400 border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10",
                critical: "text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/10",
              };
              return (
                <button
                  key={u.username}
                  data-testid={`demo-user-${u.username}`}
                  type="button"
                  onClick={() => {
                    loginForm.setValue("username", u.username);
                    loginForm.setValue("password", "demo123");
                  }}
                  className={`text-left px-3 py-2 rounded-lg border font-mono text-xs transition-colors cursor-pointer ${colors[u.risk]}`}
                >
                  <div className="font-semibold truncate">{u.username}</div>
                  <div className="text-[10px] uppercase opacity-70">{u.risk} risk</div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-3 text-center">All passwords: demo123</p>
        </div>
      )}
    </div>
  );
}
