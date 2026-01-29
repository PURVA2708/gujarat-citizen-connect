import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  MapPin, 
  CheckCircle, 
  Award, 
  Clock, 
  AlertTriangle,
  FileText,
  Plus,
  History,
  Ticket
} from 'lucide-react';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '@/lib/types';
import { ComplaintForm } from '@/components/complaints/ComplaintForm';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';

export default function UserDashboard() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints((data || []) as Complaint[]);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = () => {
    setShowForm(false);
    fetchComplaints();
    refreshProfile();
    toast({
      title: 'Complaint Submitted!',
      description: 'Your complaint has been registered successfully.',
    });
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, in_progress: 0, completed: 0 };
    complaints.forEach(c => {
      counts[c.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome, {profile?.full_name || 'Citizen'}!
            </h1>
            <p className="text-muted-foreground">
              Track your complaints and earn rewards for contributing to a cleaner Gujarat.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <Award className="w-8 h-8 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">Points</span>
              </div>
              <div className="stat-value text-secondary">{profile?.reward_points || 0}</div>
              <div className="stat-label">Reward Points</div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-8 h-8 text-pending" />
                <span className="text-xs font-medium text-muted-foreground">Status</span>
              </div>
              <div className="stat-value text-pending">{statusCounts.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-inprogress" />
                <span className="text-xs font-medium text-muted-foreground">Status</span>
              </div>
              <div className="stat-value text-inprogress">{statusCounts.in_progress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-8 h-8 text-completed" />
                <span className="text-xs font-medium text-muted-foreground">Status</span>
              </div>
              <div className="stat-value text-completed">{statusCounts.completed}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <GovButton onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5" />
              Register New Complaint
            </GovButton>
            {profile && profile.reward_points >= 10 && (
              <GovButton variant="secondary" onClick={() => navigate('/rewards')}>
                <Ticket className="w-5 h-5" />
                Redeem Points
              </GovButton>
            )}
          </div>

          {/* Complaint Form Modal/Section */}
          {showForm && (
            <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Register New Complaint</h2>
                    <button 
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <ComplaintForm onSuccess={handleComplaintSubmit} onCancel={() => setShowForm(false)} />
                </div>
              </div>
            </div>
          )}

          {/* Complaints List */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Your Complaints</h2>
              <span className="ml-auto text-sm text-muted-foreground">{complaints.length} total</span>
            </div>

            {complaints.length === 0 ? (
              <div className="gov-card p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Complaints Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start contributing to a cleaner Gujarat by reporting civic issues.
                </p>
                <GovButton onClick={() => setShowForm(true)}>
                  <Plus className="w-5 h-5" />
                  Register Your First Complaint
                </GovButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
