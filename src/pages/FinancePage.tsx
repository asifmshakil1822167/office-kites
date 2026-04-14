import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const emptyForm: { type: 'income' | 'expense'; category: string; amount: number; description: string; date: string } = { type: 'income', category: '', amount: 0, description: '', date: '' };

const FinancePage = () => {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  const monthlyData = transactions.reduce<Record<string, { month: string; income: number; expense: number }>>((acc, t) => {
    const m = t.date.slice(0, 7);
    if (!acc[m]) acc[m] = { month: m, income: 0, expense: 0 };
    acc[m][t.type === 'income' ? 'income' : 'expense'] += t.amount;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.amount) { toast.error('Category and amount required'); return; }
    addTransaction(form);
    toast.success('Transaction recorded');
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const stats = [
    { label: 'Total Income', value: income, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Expenses', value: expenses, icon: TrendingDown, color: 'text-destructive' },
    { label: 'Net Profit', value: net, icon: DollarSign, color: net >= 0 ? 'text-success' : 'text-destructive' },
  ];

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="module-header">Finance</h1>
          <p className="text-muted-foreground text-sm mt-1">Track income, expenses, and reports</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'income' | 'expense' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Amount ($)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              <Button type="submit" className="w-full">Record Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">${Math.abs(s.value).toLocaleString()}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <h2 className="font-semibold text-foreground mb-4">Monthly Summary</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
            <Tooltip />
            <Bar dataKey="income" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  <TableCell><Badge variant={t.type === 'income' ? 'default' : 'destructive'}>{t.type}</Badge></TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="font-medium">${t.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { deleteTransaction(t.id); toast.success('Transaction removed'); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
