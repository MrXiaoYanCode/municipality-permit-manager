export type BusinessType =
  | "restaurant"
  | "beauty_salon"
  | "cafe"
  | "event"
  | "signage"
  | "food_truck";

export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

export type PermitStatus = "active" | "expiring" | "expired" | "pending" | "renewed";

export type InspectionStatus =
  | "scheduled"
  | "completed"
  | "failed"
  | "rescheduled"
  | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  document_quota: number;
  documents_used: number;
  quota_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  business_type: BusinessType;
  address: string | null;
  municipality: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permit {
  id: string;
  business_id: string;
  user_id: string;
  name: string;
  permit_number: string | null;
  municipality: string | null;
  status: PermitStatus;
  issue_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  notes: string | null;
  document_url: string | null;
  ai_extracted_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  business_id: string;
  user_id: string;
  permit_id: string | null;
  title: string;
  scheduled_date: string;
  status: InspectionStatus;
  inspector_name: string | null;
  notes: string | null;
  result: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  required: boolean;
  completed: boolean;
  completed_at?: string;
}

export interface ComplianceChecklist {
  id: string;
  business_id: string;
  user_id: string;
  business_type: BusinessType;
  items: ChecklistItem[];
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  business_id: string | null;
  permit_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  processing_status: "pending" | "processing" | "completed" | "failed";
  ai_summary: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  business_id: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ExtractedPermitData {
  permit_name: string | null;
  permit_number: string | null;
  municipality: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  renewal_date: string | null;
  requirements: string[];
  conditions: string[];
  fees: string | null;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: "Restaurant",
  beauty_salon: "Beauty Salon",
  cafe: "Cafe",
  event: "Events",
  signage: "Advertising Signage",
  food_truck: "Food Truck",
};

export const SUBSCRIPTION_TIERS = {
  free: { name: "Free", quota: 5, price: 0 },
  starter: { name: "Starter", quota: 50, price: 19 },
  professional: { name: "Professional", quota: 200, price: 49 },
  enterprise: { name: "Enterprise", quota: -1, price: 99 },
} as const;
