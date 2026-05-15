import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { useListTransactions, getListTransactionsQueryKey, useCreateTransaction } from "@workspace/api-client-react";
import { TransactionInputTransactionType } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, Plus, ArrowUpRight, ShieldAlert, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const txSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  beneficiary: z.string().min(1, "Beneficiary is required"),
  transactionType: z.enum(["transfer", "payment", "withdrawal"]),
  description: z.string().optional(),
});

export default function Transactions() {
  const { session } = useAuth();
  const sessionToken = session?.sessionToken;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: transactions, isLoading } = useListTransactions({
    query: {
      enabled: !!sessionToken,
      queryKey: getListTransactionsQueryKey(),
    },
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const createMutation = useCreateTransaction({
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const form = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: {
      amount: 100,
      beneficiary: "",
      transactionType: "transfer",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof txSchema>) => {
    if (!sessionToken) return;
    try {
      const res = await createMutation.mutateAsync({
        data: { ...data, sessionToken }
      });
      
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      
      toast({
        title: "Transaction Processed",
        description: res.message,
        variant: res.action === 'block' ? 'destructive' : res.action === 'allow' ? 'default' : 'destructive',
      });
      
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to process transaction", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">COMPLETED</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">FLAGGED</Badge>;
      case 'blocked':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">BLOCKED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground font-mono mt-1">Transaction history and risk analysis</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                <Plus className="w-4 h-4 mr-2" />
                NEW TRANSACTION
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-border bg-card">
              <DialogHeader>
                <DialogTitle className="font-mono uppercase tracking-wider">Initiate Transaction</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="beneficiary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-mono">Beneficiary</FormLabel>
                        <FormControl>
                          <Input placeholder="Account or Name" {...field} className="bg-background font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-mono">Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} className="bg-background font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase font-mono">Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background font-mono">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="transfer">Transfer</SelectItem>
                              <SelectItem value="payment">Payment</SelectItem>
                              <SelectItem value="withdrawal">Withdrawal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                    EXECUTE
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Ledger</CardTitle>
            <CardDescription>Complete history with attached risk scores</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono">No transactions recorded.</div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-mono text-xs uppercase">Date</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Beneficiary</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Type</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Amount</TableHead>
                      <TableHead className="font-mono text-xs uppercase">Status</TableHead>
                      <TableHead className="font-mono text-xs uppercase text-right">Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-border hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium">{tx.beneficiary}</TableCell>
                        <TableCell className="uppercase text-xs tracking-wider text-muted-foreground">{tx.transactionType}</TableCell>
                        <TableCell className="text-right font-mono font-bold">${tx.amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-mono ${tx.riskScore > 60 ? 'text-destructive' : tx.riskScore > 30 ? 'text-amber-500' : 'text-primary'}`}>
                              {tx.riskScore}
                            </span>
                            {tx.riskScore > 60 && <ShieldAlert className="w-4 h-4 text-destructive" />}
                            {tx.riskScore > 30 && tx.riskScore <= 60 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          </div>
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
