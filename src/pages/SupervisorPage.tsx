import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, CheckCircle2, Clock, ListOrdered, XCircle } from 'lucide-react';
import { STATUSES, STATUS_LABEL, useServiceRequests } from '@/hooks/useServiceRequests';
import LiveBadge from '@/components/LiveBadge';
import { Badge } from '@/components/ui/badge';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-3, var(--muted-foreground)))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

const SupervisorPage = () => {
  const { requests, events, live, lastUpdate, loading } = useServiceRequests();

  const counts = useMemo(() => {
    const base = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<string, number>;
    requests.forEach((r) => { base[r.status] += 1; });
    return base;
  }, [requests]);

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => map.set(r.priority, (map.get(r.priority) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [requests]);

  const statusData = STATUSES.map((s) => ({ name: STATUS_LABEL[s], value: counts[s] }));

  const avgMinutes = useMemo(() => {
    const done = requests.filter((r) => r.completed_at);
    if (!done.length) return null;
    const total = done.reduce(
      (sum, r) => sum + (new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime()),
      0,
    );
    return Math.round(total / done.length / 60000);
  }, [requests]);

  const cards = [
    { label: 'In Queue', value: counts.queue, icon: ListOrdered },
    { label: 'Processing', value: counts.processing, icon: Activity },
    { label: 'Completed', value: counts.completed, icon: CheckCircle2 },
    { label: 'Failed / Cancelled', value: counts.failed + counts.cancelled, icon: XCircle },
    { label: 'Avg handling', value: avgMinutes === null ? '—' : `${avgMinutes}m`, icon: Clock },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live overview of every service request and status change.
          </p>
        </div>
        <LiveBadge live={live} lastUpdate={lastUpdate} />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4">Requests by status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4">Priority mix</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={90} label>
                {byPriority.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-foreground">Live activity feed</h2>
        </div>
        <ul className="divide-y max-h-96 overflow-auto">
          {loading && <li className="px-4 py-6 text-sm text-muted-foreground">Loading…</li>}
          {!loading && events.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">No activity recorded yet.</li>
          )}
          {events.map((e) => {
            const req = requests.find((r) => r.id === e.request_id);
            return (
              <li key={e.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {req ? `${req.reference} — ${req.title}` : 'Request'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.from_status && <Badge variant="outline">{STATUS_LABEL[e.from_status]}</Badge>}
                  <span className="text-muted-foreground">→</span>
                  {e.to_status && <Badge variant="secondary">{STATUS_LABEL[e.to_status]}</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SupervisorPage;
