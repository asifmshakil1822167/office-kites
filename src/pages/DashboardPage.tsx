import { useStore } from '@/store/useStore';
import { Users, Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['hsl(215, 90%, 50%)', 'hsl(152, 60%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 55%)', 'hsl(280, 60%, 50%)'];

const DashboardPage = () => {
  const { employees, products, transactions } = useStore();

  const totalRevenue = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lowStock = products.filter((p) => p.quantity <= p.lowStockThreshold);

  const monthlyData = transactions.reduce<Record<string, { month: string; income: number; expense: number }>>((acc, t) => {
    const m = t.date.slice(0, 7);
    if (!acc[m]) acc[m] = { month: m, income: 0, expense: 0 };
    acc[m][t.type === 'income' ? 'income' : 'expense'] += t.amount;
    return acc;
  }, {});
  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const deptData = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(deptData).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'text-primary' },
    { label: 'Products', value: products.length, icon: Package, color: 'text-accent-foreground' },
    { label: 'Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-success' },
    { label: 'Expenses', value: `$${(totalExpenses / 1000).toFixed(1)}k`, icon: TrendingDown, color: 'text-destructive' },
  ];

  return (
    <div className="page-container">
      <div>
        <h1 className="module-header">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your business operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Low Stock Alert</p>
            <p className="text-sm text-muted-foreground">{lowStock.map((p) => `${p.name} (${p.quantity})`).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 stat-card">
          <h2 className="font-semibold text-foreground mb-4">Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={280}>
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
        <div className="stat-card">
          <h2 className="font-semibold text-foreground mb-4">Employees by Dept</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
