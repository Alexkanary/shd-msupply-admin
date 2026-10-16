export type StorageRequirement = 'AMBIENT' | 'COLD_CHAIN' | 'FROZEN';

export type ExpiryStatus = 'GREEN' | 'AMBER' | 'RED';

export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'FULFILLED';

export type EquipmentType = 'FRIDGE' | 'FREEZER' | 'COLD_BOX';

export type EquipmentStatus = 'ACTIVE' | 'RETIRED';

export type ExcursionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExcursionStatus = 'OPEN' | 'RESOLVED';

export type OutageType = 'POWER_OUTAGE' | 'EQUIPMENT_FAULT';

export interface Clinic {
  id: string;
  clinic_code: string;
  name: string;
  location: string;
  last_report_date: string; // ISO 8601 UTC
  active: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  category: string;
  reorder_level: number;
  storage_requirement: StorageRequirement;
  active: boolean;
}

export interface Batch {
  id: string;
  clinic_id: string;
  item_id: string;
  batch_number: string;
  quantity: number;
  expiry_date: string; // YYYY-MM-DD
  equipment_id?: string | null;
  updated_at: string;
}

export interface ReportLine {
  id: string;
  report_id: string;
  item_id: string;
  batch_number: string;
  expiry_date: string;
  quantity_on_hand: number;
  quantity_used: number;
}

export interface Report {
  id: string;
  clinic_id: string;
  period_type: 'WEEKLY' | 'MONTHLY';
  period_start: string;
  period_end: string;
  submitted_at: string;
  received_at: string;
  lines: ReportLine[];
}

export interface RequisitionLine {
  id: string;
  requisition_id: string;
  item_id: string;
  requested_qty: number;
  approved_qty: number | null;
}

export interface Requisition {
  id: string;
  requisition_number: string;
  clinic_id: string;
  status: RequisitionStatus;
  note?: string;
  created_at: string;
  updated_at: string;
  lines: RequisitionLine[];
}

export interface Equipment {
  id: string;
  clinic_id: string;
  equipment_code: string;
  type: EquipmentType;
  name: string;
  location: string;
  model: string;
  install_date: string;
  min_temp: number;
  max_temp: number;
  status: EquipmentStatus;
  last_reading_temp?: number;
  last_reading_time?: string;
}

export interface TemperatureLog {
  id: string;
  clinic_id: string;
  equipment_id: string;
  temperature: number;
  min_temp: number;
  max_temp: number;
  logged_at: string;
  logged_by: string;
  notes?: string;
}

export interface Excursion {
  id: string;
  clinic_id: string;
  equipment_id: string;
  temperature_log_id?: string;
  detected_at: string;
  severity: ExcursionSeverity;
  duration_minutes: number;
  action_taken: string;
  notes?: string;
  status: ExcursionStatus;
  resolved_by?: string;
  resolved_at?: string;
}

export interface OutageLog {
  id: string;
  clinic_id: string;
  equipment_id?: string | null;
  type: OutageType;
  started_at: string;
  ended_at?: string | null;
  notes: string;
}

export interface AppSettings {
  api_base_url: string;
  timezone: string;
  expected_readings_per_day: number;
  safe_temp_min: number;
  safe_temp_max: number;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}
