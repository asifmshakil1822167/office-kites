import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, UserCheck, Loader2 } from 'lucide-react';
import {
  PRIORITIES,
  STATUSES,
  STATUS_LABEL,
  useServiceRequests,
  type RequestPriority,
  type RequestStatus,
} from '@/hooks/useServiceRequests';
import LiveBadge from '@/components/LiveBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const statusVariant = (s: RequestStatus) =>
  s === 'completed' ? 'default' : s === 'failed' || s === 'cancelled' ? 'destructive' : 'secondary';

const ServiceRequestsPage = () => {
  const { requests, loading, live, lastUpdate, createRequest, updateStatus, assignToMe, deleteRequest } =
    useServiceRequests();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', customer_name: '', description: '', category: 'General',
    priority: 'medium' as RequestPriority,
  });

  const filtered = useMemo(
    () =>
      requests.filter((r) => {
        const q = search.toLowerCase();
        const matches =
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q);
        return matches && (statusFilter === 'all' || r.status === statusFilter);
      }),
    [requests, search, statusFilter],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const error = await createRequest(form);
    setSaving(false);
    if (error) {
      toast({ title: 'Could not create request', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Request created', description: 'All dashboards were updated instantly.' });
    setForm({ title: '', customer_name: '', description: '', category: 'General', priority: 'medium' });
    setOpen(false);
  };

  const changeStatus = async (id: string, status: RequestStatus) => {
    const error = await updateStatus(id, status);
    if (error) toast({ title: 'Update failed', description: error, variant: 'destructive' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Requests</h1>
          <p className="text-sm text-muted-foreground">Operator console — create and progress requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge live={live} lastUpdate={lastUpdate} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4" /> New Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New service request</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sr-title">Title</Label>
                  <Input id="sr-title" required maxLength={120} value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sr-customer">Customer</Label>
                  <Input id="sr-customer" required maxLength={120} value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sr-category">Category</Label>
                    <Input id="sr-category" maxLength={60} value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority}
                      onValueChange={(v) => setForm({ ...form, priority: v as RequestPriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sr-desc">Description</Label>
                  <Textarea id="sr-desc" maxLength={1000} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : 'Create request'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search title, customer or reference"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Reference</th>
                <th className="text-left font-medium px-4 py-3">Request</th>
                <th className="text-left font-medium px-4 py-3">Customer</th>
                <th className="text-left font-medium px-4 py-3">Priority</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No requests yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.category}</div>
                  </td>
                  <td className="px-4 py-3">{r.customer_name}</td>
                  <td className="px-4 py-3 capitalize">{r.priority}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Select value={r.status} onValueChange={(v) => changeStatus(r.id, v as RequestStatus)}>
                        <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" title="Assign to me"
                        onClick={() => assignToMe(r.id)}>
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete"
                        onClick={() => deleteRequest(r.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestsPage;
