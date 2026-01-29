import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { GovInput } from '@/components/ui/gov-input';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: 'Reset Link Sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email.',
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
          <div className="gov-card p-8">
            {sent ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-completed/10 text-completed mb-6">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in the email to reset your password.
                </p>
                <Link to="/login">
                  <GovButton variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </GovButton>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <GovInput
                    type="email"
                    label="Email Address"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    required
                  />

                  <GovButton 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </GovButton>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
