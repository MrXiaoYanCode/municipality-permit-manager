import type { BusinessType, ChecklistItem } from "@/types";

export const CHECKLIST_TEMPLATES: Record<BusinessType, Omit<ChecklistItem, "completed">[]> = {
  restaurant: [
    { id: "r1", title: "Health Permit", category: "permits", required: true },
    { id: "r2", title: "Food Handler Certificates", category: "staff", required: true },
    { id: "r3", title: "Fire Safety Inspection", category: "inspections", required: true },
    { id: "r4", title: "Liquor License", category: "permits", required: false },
    { id: "r5", title: "Grease Trap Maintenance", category: "maintenance", required: true },
    { id: "r6", title: "Pest Control Records", category: "maintenance", required: true },
    { id: "r7", title: "Employee Health Records", category: "staff", required: true },
    { id: "r8", title: "Outdoor Signage Permit", category: "permits", required: false },
  ],
  beauty_salon: [
    { id: "b1", title: "Business License", category: "permits", required: true },
    { id: "b2", title: "Cosmetology License", category: "permits", required: true },
    { id: "b3", title: "Sanitation Permit", category: "permits", required: true },
    { id: "b4", title: "Fire Safety Inspection", category: "inspections", required: true },
    { id: "b5", title: "Sterilization Equipment Logs", category: "maintenance", required: true },
    { id: "b6", title: "Chemical Storage Compliance", category: "safety", required: true },
  ],
  cafe: [
    { id: "c1", title: "Food Service Permit", category: "permits", required: true },
    { id: "c2", title: "Health Inspection", category: "inspections", required: true },
    { id: "c3", title: "Outdoor Seating Permit", category: "permits", required: false },
    { id: "c4", title: "Music/Entertainment License", category: "permits", required: false },
    { id: "c5", title: "Waste Disposal Contract", category: "maintenance", required: true },
  ],
  event: [
    { id: "e1", title: "Special Event Permit", category: "permits", required: true },
    { id: "e2", title: "Noise Ordinance Compliance", category: "compliance", required: true },
    { id: "e3", title: "Temporary Structure Permit", category: "permits", required: false },
    { id: "e4", title: "Liquor Service Permit", category: "permits", required: false },
    { id: "e5", title: "Security Plan Approval", category: "safety", required: true },
    { id: "e6", title: "Insurance Certificate", category: "documents", required: true },
  ],
  signage: [
    { id: "s1", title: "Sign Permit Application", category: "permits", required: true },
    { id: "s2", title: "Zoning Compliance Review", category: "compliance", required: true },
    { id: "s3", title: "Structural Engineering Approval", category: "safety", required: false },
    { id: "s4", title: "Electrical Permit", category: "permits", required: false },
    { id: "s5", title: "Installation Inspection", category: "inspections", required: true },
  ],
  food_truck: [
    { id: "f1", title: "Mobile Food Vendor Permit", category: "permits", required: true },
    { id: "f2", title: "Vehicle Health Inspection", category: "inspections", required: true },
    { id: "f3", title: "Commissary Agreement", category: "documents", required: true },
    { id: "f4", title: "Fire Suppression System Cert", category: "safety", required: true },
    { id: "f5", title: "Parking/Location Permits", category: "permits", required: true },
    { id: "f6", title: "Propane Tank Inspection", category: "safety", required: true },
  ],
};

export function createChecklistForType(businessType: BusinessType): ChecklistItem[] {
  return CHECKLIST_TEMPLATES[businessType].map((item) => ({
    ...item,
    completed: false,
  }));
}

export function calculateCompletion(items: ChecklistItem[]): number {
  if (items.length === 0) return 0;
  const completed = items.filter((i) => i.completed).length;
  return Math.round((completed / items.length) * 100);
}
