import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, AlertTriangle } from 'lucide-react';

const LoginPage = () => {
  const login = useStore((s) => s.login);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo only: role is fixed to 'Employee'. Real role assignment must come
    // from a server-validated session (e.g. Supabase Auth + a profiles/roles
    // table enforced via RLS). Never trust a client-supplied role claim.
    if (name.trim()) login(name.trim(), 'Employee');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ERP System</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required maxLength={100} />
          </div>
          <Button type="submit" className="w-full">Continue</Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo: any name continues as a standard Employee user.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
