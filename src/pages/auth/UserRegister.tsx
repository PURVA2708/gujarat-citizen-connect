import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { GovInput } from '@/components/ui/gov-input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function UserRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      const validated = registerSchema.parse(formData);

      // Sign up user
      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: validated.fullName,
            phone: validated.phone,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created. Redirecting to dashboard...',
      });

      // Small delay then navigate
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground mb-4">
                <User className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Citizen Registration</h1>
              <p className="text-muted-foreground mt-2">
                Create your account to report complaints
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <GovInput
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                icon={<User className="w-5 h-5" />}
                error={errors.fullName}
                required
              />

              <GovInput
                type="email"
                label="Email Address (Gmail)"
                placeholder="your.email@gmail.com"
                value={formData.email}
                onChange={handleChange('email')}
                icon={<Mail className="w-5 h-5" />}
                error={errors.email}
                required
              />

              <GovInput
                type="tel"
                label="Mobile Number"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange('phone')}
                icon={<Phone className="w-5 h-5" />}
                error={errors.phone}
                maxLength={10}
                required
              />

              <GovInput
                type="password"
                label="Password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange('password')}
                icon={<Lock className="w-5 h-5" />}
                error={errors.password}
                required
              />

              <GovInput
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                icon={<CheckCircle className="w-5 h-5" />}
                error={errors.confirmPassword}
                required
              />

              <GovButton 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </GovButton>
            </form>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              By registering, you agree to the{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
