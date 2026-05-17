import { create } from 'zustand';

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

interface AppState {
  user: { name: string; role: 'Admin' | 'Manager' | 'Employee' } | null;
  employees: Employee[];
  attendance: AttendanceRecord[];
  products: Product[];
  transactions: Transaction[];
  login: (name: string, role: 'Admin' | 'Manager' | 'Employee') => void;
  logout: () => void;
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addAttendance: (a: Omit<AttendanceRecord, 'id'>) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const initialEmployees: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@erp.com', department: 'Engineering', role: 'Developer', salary: 75000, joinDate: '2024-01-15', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@erp.com', department: 'Marketing', role: 'Manager', salary: 82000, joinDate: '2023-06-01', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@erp.com', department: 'Finance', role: 'Analyst', salary: 68000, joinDate: '2024-03-20', status: 'active' },
  { id: '4', name: 'David Lee', email: 'david@erp.com', department: 'HR', role: 'Coordinator', salary: 55000, joinDate: '2024-07-10', status: 'active' },
  { id: '5', name: 'Eva Martinez', email: 'eva@erp.com', department: 'Engineering', role: 'Lead', salary: 95000, joinDate: '2022-11-05', status: 'active' },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Office Chair', sku: 'FUR-001', category: 'Furniture', quantity: 45, price: 299, lowStockThreshold: 10 },
  { id: '2', name: 'Standing Desk', sku: 'FUR-002', category: 'Furniture', quantity: 8, price: 549, lowStockThreshold: 10 },
  { id: '3', name: 'Laptop - Pro', sku: 'TECH-001', category: 'Electronics', quantity: 22, price: 1299, lowStockThreshold: 5 },
  { id: '4', name: 'Monitor 27"', sku: 'TECH-002', category: 'Electronics', quantity: 3, price: 399, lowStockThreshold: 5 },
  { id: '5', name: 'Keyboard', sku: 'TECH-003', category: 'Electronics', quantity: 67, price: 79, lowStockThreshold: 15 },
  { id: '6', name: 'Printer Paper', sku: 'SUP-001', category: 'Supplies', quantity: 120, price: 12, lowStockThreshold: 30 },
];

const initialTransactions: Transaction[] = [
  { id: '1', type: 'income', category: 'Sales', amount: 15000, description: 'Q1 product sales', date: '2026-01-15' },
  { id: '2', type: 'income', category: 'Services', amount: 8500, description: 'Consulting fees', date: '2026-02-10' },
  { id: '3', type: 'expense', category: 'Salaries', amount: 42000, description: 'Monthly payroll', date: '2026-01-31' },
  { id: '4', type: 'expense', category: 'Utilities', amount: 2300, description: 'Office utilities', date: '2026-02-01' },
  { id: '5', type: 'income', category: 'Sales', amount: 22000, description: 'Q1 enterprise deal', date: '2026-03-05' },
  { id: '6', type: 'expense', category: 'Equipment', amount: 5600, description: 'New laptops', date: '2026-03-12' },
  { id: '7', type: 'expense', category: 'Marketing', amount: 3200, description: 'Ad campaign', date: '2026-04-01' },
  { id: '8', type: 'income', category: 'Sales', amount: 18000, description: 'April sales', date: '2026-04-10' },
];

export const useStore = create<AppState>((set) => ({
  user: null,
  employees: initialEmployees,
  attendance: [],
  products: initialProducts,
  transactions: initialTransactions,
  login: (name, role) => set({ user: { name, role } }),
  logout: () => set({ user: null }),
  addEmployee: (e) => set((s) => ({ employees: [...s.employees, { ...e, id: uid() }] })),
  updateEmployee: (id, e) => set((s) => ({ employees: s.employees.map((em) => em.id === id ? { ...em, ...e } : em) })),
  deleteEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
  addAttendance: (a) => set((s) => ({ attendance: [...s.attendance, { ...a, id: uid() }] })),
  addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid() }] })),
  updateProduct: (id, p) => set((s) => ({ products: s.products.map((pr) => pr.id === id ? { ...pr, ...p } : pr) })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
  addTransaction: (t) => set((s) => ({ transactions: [...s.transactions, { ...t, id: uid() }] })),
  deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}));
