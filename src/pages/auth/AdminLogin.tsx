import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { GovInput } from '@/components/ui/gov-input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Shield, ArrowRight, User } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (roleData?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin dashboard.',
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials or insufficient privileges.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="gov-card p-8 border-2 border-primary/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="text-muted-foreground mt-2">
                Authorized personnel only
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-warning font-medium">
                ⚠️ This portal is for authorized government officials only. 
                Unauthorized access is prohibited by law.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <GovInput
                type="email"
                label="Official Email"
                placeholder="admin@gujaratgov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <GovInput
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <div className="flex justify-end">
                <Link 
                  to="/admin/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <GovButton 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Admin Login'}
                <ArrowRight className="w-5 h-5" />
              </GovButton>
            </form>

            {/* Citizen Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Are you a citizen?</p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <User className="w-4 h-4" />
                Go to Citizen Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
