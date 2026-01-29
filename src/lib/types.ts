// Enums matching database
export type AppRole = 'admin' | 'user';
export type ComplaintStatus = 'pending' | 'in_progress' | 'completed';
export type ComplaintCategory = 'garbage' | 'street_light' | 'road_maintenance' | 'water_supply' | 'drainage' | 'public_safety';
export type UrgencyLevel = 'high' | 'medium' | 'low';

// Database types
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  reward_points: number;
  otp_verified: boolean;
  location_permission_granted: boolean;
  camera_permission_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  category: ComplaintCategory;
  description: string | null;
  photo_url: string;
  latitude: number;
  longitude: number;
  location_address: string | null;
  status: ComplaintStatus;
  urgency: UrgencyLevel | null;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardPoint {
  id: string;
  user_id: string;
  complaint_id: string | null;
  points_earned: number;
  redeem_code: string | null;
  redeemed: boolean;
  reason: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// UI types
export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  garbage: 'Garbage Related',
  street_light: 'Street Light',
  road_maintenance: 'Road Maintenance',
  water_supply: 'Water Supply',
  drainage: 'Drainage',
  public_safety: 'Public Safety'
};

export const CATEGORY_ICONS: Record<ComplaintCategory, string> = {
  garbage: '🗑️',
  street_light: '💡',
  road_maintenance: '🛣️',
  water_supply: '💧',
  drainage: '🚰',
  public_safety: '🛡️'
};

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed'
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
};
