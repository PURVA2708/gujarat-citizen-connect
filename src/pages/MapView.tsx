import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { STATUS_LABELS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/types';

// Gujarat boundaries (approximate)
const GUJARAT_BOUNDS = {
  north: 24.7,
  south: 20.1,
  east: 74.5,
  west: 68.1,
  center: { lat: 22.309425, lng: 72.136230 }
};

export default function MapView() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints((data || []) as Complaint[]);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    statusFilter === 'all' || c.status === statusFilter
  );

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending': return 'bg-pending';
      case 'in_progress': return 'bg-inprogress';
      case 'completed': return 'bg-completed';
      default: return 'bg-muted';
    }
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, in_progress: 0, completed: 0 };
    complaints.forEach(c => {
      counts[c.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Group complaints by approximate location for the visual representation
  const groupedByLocation = filteredComplaints.reduce((acc, complaint) => {
    // Round to 1 decimal place for grouping
    const key = `${complaint.latitude.toFixed(1)}_${complaint.longitude.toFixed(1)}`;
    if (!acc[key]) {
      acc[key] = {
        lat: complaint.latitude,
        lng: complaint.longitude,
        complaints: [],
        counts: { pending: 0, in_progress: 0, completed: 0 }
      };
    }
    acc[key].complaints.push(complaint);
    acc[key].counts[complaint.status]++;
    return acc;
  }, {} as Record<string, { lat: number; lng: number; complaints: Complaint[]; counts: Record<ComplaintStatus, number> }>);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-6 h-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Gujarat Complaint Map
                </h1>
              </div>
              <p className="text-muted-foreground">
                Visual representation of complaints across Gujarat
              </p>
            </div>
            <GovButton onClick={fetchComplaints} variant="outline">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </GovButton>
          </div>

          {/* Status Legend */}
          <div className="gov-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Status Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pending"></div>
                <span className="text-sm">Pending ({statusCounts.pending})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-inprogress"></div>
                <span className="text-sm">In Progress ({statusCounts.in_progress})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-completed"></div>
                <span className="text-sm">Completed ({statusCounts.completed})</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
                  className="h-10 px-3 rounded-lg border-2 border-muted bg-background text-sm focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="gov-card overflow-hidden">
            {/* Gujarat Map Placeholder */}
            <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 aspect-[16/10] md:aspect-[2/1]">
              {/* Gujarat Outline SVG */}
              <svg 
                viewBox="0 0 400 350" 
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.3 }}
              >
                <path
                  d="M100,50 L150,30 L200,40 L250,25 L300,60 L350,80 L360,120 L340,180 L320,220 L280,260 L240,280 L200,300 L150,310 L100,280 L60,240 L40,180 L50,120 L70,80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
              </svg>

              {/* Info Box */}
              <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">Interactive Map Coming Soon</h3>
                    <p className="text-xs text-muted-foreground">
                      Google Maps integration will display live complaint locations. 
                      Add your Google Maps API key to enable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Complaint Markers (positioned relatively) */}
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                Object.values(groupedByLocation).map((group, index) => {
                  // Convert lat/lng to relative position within Gujarat bounds
                  const x = ((group.lng - GUJARAT_BOUNDS.west) / (GUJARAT_BOUNDS.east - GUJARAT_BOUNDS.west)) * 100;
                  const y = ((GUJARAT_BOUNDS.north - group.lat) / (GUJARAT_BOUNDS.north - GUJARAT_BOUNDS.south)) * 100;
                  
                  const total = group.complaints.length;
                  const primaryStatus = group.counts.pending > 0 ? 'pending' 
                    : group.counts.in_progress > 0 ? 'in_progress' : 'completed';
                  
                  return (
                    <div
                      key={index}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
                      style={{ 
                        left: `${Math.min(Math.max(x, 10), 90)}%`, 
                        top: `${Math.min(Math.max(y, 10), 90)}%` 
                      }}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg
                        ${getStatusColor(primaryStatus)}
                        hover:scale-125 transition-transform
                      `}>
                        {total}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-foreground text-background text-xs rounded-lg p-3 shadow-xl whitespace-nowrap">
                          <p className="font-semibold mb-1">{total} Complaint{total > 1 ? 's' : ''}</p>
                          {group.counts.pending > 0 && (
                            <p className="text-pending-foreground">🔴 Pending: {group.counts.pending}</p>
                          )}
                          {group.counts.in_progress > 0 && (
                            <p className="text-inprogress-foreground">🟡 In Progress: {group.counts.in_progress}</p>
                          )}
                          {group.counts.completed > 0 && (
                            <p className="text-completed-foreground">🟢 Completed: {group.counts.completed}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary Stats */}
            <div className="p-4 border-t bg-muted/30">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">{filteredComplaints.length}</div>
                  <div className="text-xs text-muted-foreground">Total Shown</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pending">{statusCounts.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-inprogress">{statusCounts.in_progress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-completed">{statusCounts.completed}</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {Object.keys(groupedByLocation).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Areas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {complaints.length > 0 
                      ? Math.round((statusCounts.completed / complaints.length) * 100) 
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Resolution Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Complaints List */}
          {filteredComplaints.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Complaints</h2>
              <div className="space-y-3">
                {filteredComplaints.slice(0, 10).map((complaint) => (
                  <div key={complaint.id} className="gov-card p-4 flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(complaint.status)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{CATEGORY_ICONS[complaint.category]}</span>
                        <span className="font-medium text-foreground">
                          {CATEGORY_LABELS[complaint.category]}
                        </span>
                        <span className={`gov-badge ${
                          complaint.status === 'pending' ? 'gov-badge-pending' :
                          complaint.status === 'in_progress' ? 'gov-badge-inprogress' :
                          'gov-badge-completed'
                        }`}>
                          {STATUS_LABELS[complaint.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {complaint.location_address || `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`}
                      </p>
                    </div>
                    <img 
                      src={complaint.photo_url} 
                      alt="" 
                      className="w-16 h-16 rounded-lg object-cover hidden sm:block"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
