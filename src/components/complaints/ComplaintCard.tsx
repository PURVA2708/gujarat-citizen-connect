import { format } from 'date-fns';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Complaint, ComplaintStatus, UrgencyLevel } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '@/lib/types';

interface ComplaintCardProps {
  complaint: Complaint;
  showUserInfo?: boolean;
  onStatusChange?: (id: string, status: ComplaintStatus) => void;
  onUrgencyChange?: (id: string, urgency: UrgencyLevel) => void;
}

export function ComplaintCard({ complaint, showUserInfo, onStatusChange, onUrgencyChange }: ComplaintCardProps) {
  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return 'gov-badge-pending';
      case 'in_progress':
        return 'gov-badge-inprogress';
      case 'completed':
        return 'gov-badge-completed';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="w-3 h-3" />;
      case 'in_progress':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getUrgencyBadgeClass = (urgency: UrgencyLevel | null) => {
    if (!urgency) return '';
    switch (urgency) {
      case 'high':
        return 'gov-badge-high';
      case 'medium':
        return 'gov-badge-medium';
      case 'low':
        return 'gov-badge-low';
      default:
        return '';
    }
  };

  return (
    <div className="gov-card overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-muted">
        <img 
          src={complaint.photo_url} 
          alt={`${CATEGORY_LABELS[complaint.category]} complaint`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground/80 backdrop-blur-sm text-primary-foreground rounded-full text-xs font-medium">
            {CATEGORY_ICONS[complaint.category]} {CATEGORY_LABELS[complaint.category]}
          </span>
        </div>
        {complaint.urgency && (
          <div className="absolute top-3 right-3">
            <span className={`gov-badge ${getUrgencyBadgeClass(complaint.urgency)}`}>
              {complaint.urgency.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`gov-badge ${getStatusBadgeClass(complaint.status)}`}>
            {getStatusIcon(complaint.status)}
            {STATUS_LABELS[complaint.status]}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(complaint.created_at), 'dd MMM yyyy')}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {complaint.location_address || `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}`}
          </span>
        </div>

        {/* Description */}
        {complaint.description && (
          <p className="text-sm text-foreground line-clamp-2">
            {complaint.description}
          </p>
        )}

        {/* Admin Notes */}
        {complaint.admin_notes && complaint.status !== 'pending' && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes:</p>
            <p className="text-sm text-foreground">{complaint.admin_notes}</p>
          </div>
        )}

        {/* Status Change Buttons for Admin */}
        {onStatusChange && complaint.status !== 'completed' && (
          <div className="flex gap-2 pt-2">
            {complaint.status === 'pending' && (
              <button
                onClick={() => onStatusChange(complaint.id, 'in_progress')}
                className="flex-1 py-2 text-xs font-medium bg-inprogress/10 text-inprogress rounded-lg hover:bg-inprogress/20 transition-colors"
              >
                Mark In Progress
              </button>
            )}
            <button
              onClick={() => onStatusChange(complaint.id, 'completed')}
              className="flex-1 py-2 text-xs font-medium bg-completed/10 text-completed rounded-lg hover:bg-completed/20 transition-colors"
            >
              Mark Completed
            </button>
          </div>
        )}

        {/* Urgency Selection for Admin */}
        {onUrgencyChange && !complaint.urgency && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Set Priority:</p>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as UrgencyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onUrgencyChange(complaint.id, level)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    level === 'high' 
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                      : level === 'medium'
                      ? 'bg-warning/10 text-warning hover:bg-warning/20'
                      : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
