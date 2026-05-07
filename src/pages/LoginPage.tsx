import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

const LoginPage = () => {
  const login = useStore((s) => s.login);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    login(name.trim(), 'Employee');
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required minLength={6} maxLength={100} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Local sign-in. For real authentication, enable Lovable Cloud.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
