import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { GovInput } from '@/components/ui/gov-input';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield,
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import type { Complaint, ComplaintCategory, ComplaintStatus, UrgencyLevel } from '@/lib/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchComplaints();
    }
  }, [isAdmin]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints((data || []) as Complaint[]);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'completed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (updateError) throw updateError;

      // If completed, award points
      if (newStatus === 'completed') {
        const complaint = complaints.find(c => c.id === complaintId);
        if (complaint) {
          // Generate redeem code
          const redeemCode = `GUJ${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          
          // Add reward points entry
          await supabase
            .from('reward_points_ledger')
            .insert({
              user_id: complaint.user_id,
              complaint_id: complaintId,
              points_earned: 10,
              redeem_code: redeemCode,
              reason: 'Complaint Resolved'
            });

          // Update user profile points
          const { data: profileData } = await supabase
            .from('profiles')
            .select('reward_points')
            .eq('user_id', complaint.user_id)
            .single();
          
          if (profileData) {
            await supabase
              .from('profiles')
              .update({ reward_points: (profileData.reward_points || 0) + 10 })
              .eq('user_id', complaint.user_id);
          }
        }
      }

      toast({
        title: 'Status Updated',
        description: `Complaint marked as ${STATUS_LABELS[newStatus]}.`,
      });

      fetchComplaints();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleUrgencyChange = async (complaintId: string, urgency: UrgencyLevel) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ urgency, updated_at: new Date().toISOString() })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: 'Priority Set',
        description: `Complaint marked as ${urgency} priority.`,
      });

      fetchComplaints();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to set priority.',
        variant: 'destructive',
      });
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesSearch = complaint.location_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    completed: complaints.filter(c => c.status === 'completed').length,
    highPriority: complaints.filter(c => c.urgency === 'high' && c.status !== 'completed').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground">
                Manage and resolve citizen complaints across Gujarat
              </p>
            </div>
            <GovButton onClick={fetchComplaints} variant="outline">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </GovButton>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            
            <div className="stat-card border-l-4 border-l-pending">
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-6 h-6 text-pending" />
              </div>
              <div className="stat-value text-pending">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            
            <div className="stat-card border-l-4 border-l-inprogress">
              <div className="flex items-center justify-between">
                <Clock className="w-6 h-6 text-inprogress" />
              </div>
              <div className="stat-value text-inprogress">{stats.in_progress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            
            <div className="stat-card border-l-4 border-l-completed">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-6 h-6 text-completed" />
              </div>
              <div className="stat-value text-completed">{stats.completed}</div>
              <div className="stat-label">Resolved</div>
            </div>
            
            <div className="stat-card border-l-4 border-l-destructive">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-6 h-6 text-destructive" />
              </div>
              <div className="stat-value text-destructive">{stats.highPriority}</div>
              <div className="stat-label">High Priority</div>
            </div>
          </div>

          {/* Filters */}
          <div className="gov-card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <GovInput
                  type="text"
                  placeholder="Search by ID, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
                  className="h-12 px-4 rounded-lg border-2 border-muted bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'all')}
                  className="h-12 px-4 rounded-lg border-2 border-muted bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Complaints Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="gov-card p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Complaints Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No complaints have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard 
                  key={complaint.id} 
                  complaint={complaint}
                  showUserInfo
                  onStatusChange={handleStatusChange}
                  onUrgencyChange={handleUrgencyChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
