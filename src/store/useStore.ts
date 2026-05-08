import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface AppUser {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  user: AppUser | null;
  authLoading: boolean;
  employees: Employee[];
  attendance: AttendanceRecord[];
  products: Product[];
  transactions: Transaction[];
  setUser: (u: AppUser | null) => void;
  setAuthLoading: (v: boolean) => void;
  logout: () => Promise<void>;
  fetchAll: () => Promise<void>;
  addEmployee: (e: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, e: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const mapEmployee = (r: any): Employee => ({
  id: r.id, name: r.name, email: r.email, department: r.department,
  role: r.role, salary: Number(r.salary), joinDate: r.join_date, status: r.status,
});
const mapProduct = (r: any): Product => ({
  id: r.id, name: r.name, sku: r.sku, category: r.category,
  quantity: r.quantity, price: Number(r.price), lowStockThreshold: r.low_stock_threshold,
});
const mapTransaction = (r: any): Transaction => ({
  id: r.id, type: r.type, category: r.category, amount: Number(r.amount),
  description: r.description, date: r.date,
});

export const useStore = create<AppState>((set, get) => ({
  user: null,
  authLoading: true,
  employees: [],
  attendance: [],
  products: [],
  transactions: [],
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, employees: [], products: [], transactions: [], attendance: [] });
  },
  fetchAll: async () => {
    const [emp, prod, tx] = await Promise.all([
      supabase.from('employees').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
    ]);
    set({
      employees: (emp.data ?? []).map(mapEmployee),
      products: (prod.data ?? []).map(mapProduct),
      transactions: (tx.data ?? []).map(mapTransaction),
    });
  },
  addEmployee: async (e) => {
    const { data, error } = await supabase.from('employees').insert({
      name: e.name, email: e.email, department: e.department, role: e.role,
      salary: e.salary, join_date: e.joinDate || new Date().toISOString().slice(0, 10), status: e.status,
    }).select().single();
    if (error) throw error;
    set((s) => ({ employees: [mapEmployee(data), ...s.employees] }));
  },
  updateEmployee: async (id, e) => {
    const patch: any = {};
    if (e.name !== undefined) patch.name = e.name;
    if (e.email !== undefined) patch.email = e.email;
    if (e.department !== undefined) patch.department = e.department;
    if (e.role !== undefined) patch.role = e.role;
    if (e.salary !== undefined) patch.salary = e.salary;
    if (e.joinDate !== undefined) patch.join_date = e.joinDate;
    if (e.status !== undefined) patch.status = e.status;
    const { data, error } = await supabase.from('employees').update(patch).eq('id', id).select().single();
    if (error) throw error;
    set((s) => ({ employees: s.employees.map((x) => x.id === id ? mapEmployee(data) : x) }));
  },
  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ employees: s.employees.filter((x) => x.id !== id) }));
  },
  addProduct: async (p) => {
    const { data, error } = await supabase.from('products').insert({
      name: p.name, sku: p.sku, category: p.category, quantity: p.quantity,
      price: p.price, low_stock_threshold: p.lowStockThreshold,
    }).select().single();
    if (error) throw error;
    set((s) => ({ products: [mapProduct(data), ...s.products] }));
  },
  updateProduct: async (id, p) => {
    const patch: any = {};
    if (p.name !== undefined) patch.name = p.name;
    if (p.sku !== undefined) patch.sku = p.sku;
    if (p.category !== undefined) patch.category = p.category;
    if (p.quantity !== undefined) patch.quantity = p.quantity;
    if (p.price !== undefined) patch.price = p.price;
    if (p.lowStockThreshold !== undefined) patch.low_stock_threshold = p.lowStockThreshold;
    const { data, error } = await supabase.from('products').update(patch).eq('id', id).select().single();
    if (error) throw error;
    set((s) => ({ products: s.products.map((x) => x.id === id ? mapProduct(data) : x) }));
  },
  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ products: s.products.filter((x) => x.id !== id) }));
  },
  addTransaction: async (t) => {
    const { data, error } = await supabase.from('transactions').insert({
      type: t.type, category: t.category, amount: t.amount,
      description: t.description, date: t.date || new Date().toISOString().slice(0, 10),
    }).select().single();
    if (error) throw error;
    set((s) => ({ transactions: [mapTransaction(data), ...s.transactions] }));
  },
  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) }));
  },
}));

export const initAuth = () => {
  const setUser = useStore.getState().setUser;
  const setAuthLoading = useStore.getState().setAuthLoading;

  const toAppUser = (u: User | null): AppUser | null => u ? {
    id: u.id,
    email: u.email ?? '',
    name: (u.user_metadata?.full_name as string) || (u.email ?? 'User'),
  } : null;

  supabase.auth.onAuthStateChange((_event, session) => {
    const u = toAppUser(session?.user ?? null);
    setUser(u);
    if (u) {
      setTimeout(() => { useStore.getState().fetchAll().catch(() => {}); }, 0);
    }
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    const u = toAppUser(session?.user ?? null);
    setUser(u);
    setAuthLoading(false);
    if (u) useStore.getState().fetchAll().catch(() => {});
  });
};
