import { useState } from 'react';
import { useStore, Employee } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm: { name: string; email: string; department: string; role: string; salary: number; joinDate: string; status: 'active' | 'inactive' } = { name: '', email: '', department: '', role: '', salary: 0, joinDate: '', status: 'active' };

const HRPage = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (e: Employee) => { setForm({ name: e.name, email: e.email, department: e.department, role: e.role, salary: e.salary, joinDate: e.joinDate, status: e.status }); setEditId(e.id); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (editId) { updateEmployee(editId, form); toast.success('Employee updated'); }
    else { addEmployee(form); toast.success('Employee added'); }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { deleteEmployee(id); toast.success('Employee removed'); };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="module-header">HR Module</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employees and payroll</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Employee</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div className="space-y-1"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                <div className="space-y-1"><Label>Salary</Label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Join Date</Label><Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} /></div>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editId ? 'Update' : 'Add'} Employee</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.email}</p></div>
                  </TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>{e.role}</TableCell>
                  <TableCell>${e.salary.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No employees found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HRPage;
