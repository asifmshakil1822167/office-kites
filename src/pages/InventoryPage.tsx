import { useState } from 'react';
import { useStore, Product } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = { name: '', sku: '', category: '', quantity: 0, price: 0, lowStockThreshold: 10 };

const InventoryPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (p: Product) => { setForm({ name: p.name, sku: p.sku, category: p.category, quantity: p.quantity, price: p.price, lowStockThreshold: p.lowStockThreshold }); setEditId(p.id); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) { toast.error('Name and SKU required'); return; }
    if (editId) { updateProduct(editId, form); toast.success('Product updated'); }
    else { addProduct(form); toast.success('Product added'); }
    setDialogOpen(false);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="module-header">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage products and stock levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-1"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Low Stock Alert</Label><Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} /></div>
              </div>
              <Button type="submit" className="w-full">{editId ? 'Update' : 'Add'} Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const isLow = p.quantity <= p.lowStockThreshold;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>${p.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Low</Badge>
                      ) : (
                        <Badge variant="secondary">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteProduct(p.id); toast.success('Product removed'); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
