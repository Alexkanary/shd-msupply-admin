import {
  Clinic,
  Item,
  Batch,
  Equipment,
  TemperatureLog,
  Excursion,
  OutageLog,
  Report,
  Requisition,
} from '../types';

export const INITIAL_CLINICS: Clinic[] = [
  {
    id: 'cl-01',
    clinic_code: 'ML-01',
    name: 'Mae La Clinic',
    location: 'Zone C, Tha Song Yang, Tak',
    last_report_date: '2026-10-14T08:30:00Z',
    active: true,
    created_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'cl-02',
    clinic_code: 'WP-02',
    name: 'Wang Pha Clinic',
    location: 'Mae Ramat Border Sector, Tak',
    last_report_date: '2026-10-15T11:45:00Z',
    active: true,
    created_at: '2025-02-15T00:00:00Z',
  },
  {
    id: 'cl-03',
    clinic_code: 'MK-03',
    name: 'Maw Khee Clinic',
    location: 'Phop Phra South District',
    last_report_date: '2026-10-12T09:15:00Z',
    active: true,
    created_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'cl-04',
    clinic_code: 'MT-04',
    name: 'Mae Tao Outpost',
    location: 'Mae Sot Riverside Sub-district',
    last_report_date: '2026-10-15T16:20:00Z',
    active: true,
    created_at: '2025-01-20T00:00:00Z',
  },
  {
    id: 'cl-05',
    clinic_code: 'UP-05',
    name: 'Umpiem Health Post',
    location: 'Km 87 Highway 1090, Umphang Route',
    last_report_date: '2026-10-11T14:10:00Z',
    active: true,
    created_at: '2025-04-12T00:00:00Z',
  },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-01',
    name: 'Oxytocin 10 IU/ml Injection',
    unit: 'Ampoule (10s)',
    category: 'Maternal Health',
    reorder_level: 100,
    storage_requirement: 'COLD_CHAIN',
    active: true,
  },
  {
    id: 'item-02',
    name: 'Rabies Vaccine (PVRV) 0.5ml + Diluent',
    unit: 'Vial',
    category: 'Vaccines',
    reorder_level: 50,
    storage_requirement: 'COLD_CHAIN',
    active: true,
  },
  {
    id: 'item-03',
    name: 'Insulin Human Regular (100 IU/ml, 10ml)',
    unit: 'Vial',
    category: 'Endocrinology',
    reorder_level: 30,
    storage_requirement: 'COLD_CHAIN',
    active: true,
  },
  {
    id: 'item-04',
    name: 'Oral Polio Vaccine (bOPV 20-dose)',
    unit: 'Vial',
    category: 'Vaccines',
    reorder_level: 40,
    storage_requirement: 'FROZEN',
    active: true,
  },
  {
    id: 'item-05',
    name: 'Amoxicillin 500mg Capsules',
    unit: 'Bottle (500s)',
    category: 'Antibiotics',
    reorder_level: 80,
    storage_requirement: 'AMBIENT',
    active: true,
  },
  {
    id: 'item-06',
    name: 'Artemether-Lumefantrine 20/120mg Tabs',
    unit: 'Blister (24s)',
    category: 'Antimalarials',
    reorder_level: 120,
    storage_requirement: 'AMBIENT',
    active: true,
  },
  {
    id: 'item-07',
    name: 'Ceftriaxone 1g Powder for Injection',
    unit: 'Vial',
    category: 'Antibiotics',
    reorder_level: 75,
    storage_requirement: 'AMBIENT',
    active: true,
  },
  {
    id: 'item-08',
    name: 'Oral Rehydration Salts (ORS) WHO formula',
    unit: 'Sachet (50s)',
    category: 'Consumables',
    reorder_level: 200,
    storage_requirement: 'AMBIENT',
    active: true,
  },
  {
    id: 'item-09',
    name: 'Paracetamol 500mg Tablets',
    unit: 'Bottle (1000s)',
    category: 'Analgesics',
    reorder_level: 150,
    storage_requirement: 'AMBIENT',
    active: true,
  },
  {
    id: 'item-10',
    name: 'Tetanus Toxoid Vaccine (0.5ml)',
    unit: 'Ampoule',
    category: 'Vaccines',
    reorder_level: 60,
    storage_requirement: 'COLD_CHAIN',
    active: true,
  },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-01',
    clinic_id: 'cl-01',
    equipment_code: 'ML-FR-01',
    type: 'FRIDGE',
    name: 'Main Vaccine Refrigerator',
    location: 'MCH Room 102',
    model: 'Vestfrost VLS 024 SD',
    install_date: '2024-05-10',
    min_temp: 2.0,
    max_temp: 8.0,
    status: 'ACTIVE',
    last_reading_temp: 4.2,
    last_reading_time: '2026-10-15T23:00:00Z',
  },
  {
    id: 'eq-02',
    clinic_id: 'cl-01',
    equipment_code: 'ML-FZ-02',
    type: 'FREEZER',
    name: 'Icepack & Vaccine Freezer',
    location: 'Lab Supply Storage',
    model: 'Haier HBD-116',
    install_date: '2024-08-20',
    min_temp: -25.0,
    max_temp: -15.0,
    status: 'ACTIVE',
    last_reading_temp: -18.5,
    last_reading_time: '2026-10-15T23:00:00Z',
  },
  {
    id: 'eq-03',
    clinic_id: 'cl-02',
    equipment_code: 'WP-FR-01',
    type: 'FRIDGE',
    name: 'EPI & Insulin Solar Fridge',
    location: 'Immunization Station',
    model: 'Dometic TCX 21 Solar Drive',
    install_date: '2023-11-14',
    min_temp: 2.0,
    max_temp: 8.0,
    status: 'ACTIVE',
    last_reading_temp: 9.1, // Currently in excursion!
    last_reading_time: '2026-10-16T04:15:00Z',
  },
  {
    id: 'eq-04',
    clinic_id: 'cl-03',
    equipment_code: 'MK-FR-01',
    type: 'FRIDGE',
    name: 'Pharmacy Cold Chain Unit',
    location: 'Dispensary Zone',
    model: 'Vestfrost MK 144',
    install_date: '2024-01-05',
    min_temp: 2.0,
    max_temp: 8.0,
    status: 'ACTIVE',
    last_reading_temp: 5.6,
    last_reading_time: '2026-10-14T02:00:00Z', // Overdue (>24 hours!)
  },
  {
    id: 'eq-05',
    clinic_id: 'cl-04',
    equipment_code: 'MT-CB-01',
    type: 'COLD_BOX',
    name: 'Mobile Outreach Cold Box A',
    location: 'Emergency Outreach Van',
    model: 'AOV Cold Box 24L',
    install_date: '2025-06-18',
    min_temp: 2.0,
    max_temp: 8.0,
    status: 'ACTIVE',
    last_reading_temp: 3.8,
    last_reading_time: '2026-10-16T05:30:00Z',
  },
  {
    id: 'eq-06',
    clinic_id: 'cl-05',
    equipment_code: 'UP-FR-01',
    type: 'FRIDGE',
    name: 'Umpiem Main Clinic Fridge',
    location: 'Consultation Room 3',
    model: 'B Medical Systems TCW 40SD',
    install_date: '2023-09-12',
    min_temp: 2.0,
    max_temp: 8.0,
    status: 'ACTIVE',
    last_reading_temp: 4.8,
    last_reading_time: '2026-10-16T01:00:00Z',
  },
];

export const INITIAL_BATCHES: Batch[] = [
  // Red batches (expiring within 3 months: current year is 2026)
  {
    id: 'batch-01',
    clinic_id: 'cl-01',
    item_id: 'item-01', // Oxytocin
    batch_number: 'OXY-24B09',
    quantity: 140,
    expiry_date: '2026-11-20', // Expiring in ~1 month (RED)
    equipment_id: 'eq-01',
    updated_at: '2026-10-14T08:30:00Z',
  },
  {
    id: 'batch-02',
    clinic_id: 'cl-02',
    item_id: 'item-02', // Rabies Vaccine
    batch_number: 'RAB-25A14',
    quantity: 35,
    expiry_date: '2026-12-05', // Expiring in <2 months (RED)
    equipment_id: 'eq-03',
    updated_at: '2026-10-15T11:45:00Z',
  },
  {
    id: 'batch-03',
    clinic_id: 'cl-03',
    item_id: 'item-07', // Ceftriaxone
    batch_number: 'CEF-24X88',
    quantity: 60,
    expiry_date: '2026-11-01', // Expiring in 2 weeks (RED)
    equipment_id: null,
    updated_at: '2026-10-12T09:15:00Z',
  },
  // Amber batches (expiring within 6 months: between 3 and 6 months)
  {
    id: 'batch-04',
    clinic_id: 'cl-01',
    item_id: 'item-03', // Insulin
    batch_number: 'INS-25H02',
    quantity: 45,
    expiry_date: '2027-02-15', // ~4 months (AMBER)
    equipment_id: 'eq-01',
    updated_at: '2026-10-14T08:30:00Z',
  },
  {
    id: 'batch-05',
    clinic_id: 'cl-04',
    item_id: 'item-06', // Artemether-Lumefantrine
    batch_number: 'ALM-25D11',
    quantity: 110,
    expiry_date: '2027-03-25', // ~5 months (AMBER)
    equipment_id: null,
    updated_at: '2026-10-15T16:20:00Z',
  },
  {
    id: 'batch-06',
    clinic_id: 'cl-05',
    item_id: 'item-10', // Tetanus Toxoid
    batch_number: 'TT-25F09',
    quantity: 80,
    expiry_date: '2027-01-30', // ~3.5 months (AMBER)
    equipment_id: 'eq-06',
    updated_at: '2026-10-11T14:10:00Z',
  },
  // Green batches (healthy > 6 months)
  {
    id: 'batch-07',
    clinic_id: 'cl-01',
    item_id: 'item-05', // Amoxicillin
    batch_number: 'AMX-26A01',
    quantity: 250,
    expiry_date: '2027-08-31', // >10 months (GREEN)
    equipment_id: null,
    updated_at: '2026-10-14T08:30:00Z',
  },
  {
    id: 'batch-08',
    clinic_id: 'cl-01',
    item_id: 'item-08', // ORS
    batch_number: 'ORS-26C15',
    quantity: 400,
    expiry_date: '2028-04-30', // >18 months (GREEN)
    equipment_id: null,
    updated_at: '2026-10-14T08:30:00Z',
  },
  {
    id: 'batch-09',
    clinic_id: 'cl-02',
    item_id: 'item-01', // Oxytocin
    batch_number: 'OXY-26E03',
    quantity: 180,
    expiry_date: '2027-10-15', // >12 months (GREEN)
    equipment_id: 'eq-03',
    updated_at: '2026-10-15T11:45:00Z',
  },
  {
    id: 'batch-10',
    clinic_id: 'cl-02',
    item_id: 'item-04', // OPV
    batch_number: 'OPV-26B22',
    quantity: 65,
    expiry_date: '2027-09-10', // >11 months (GREEN)
    equipment_id: 'eq-03',
    updated_at: '2026-10-15T11:45:00Z',
  },
  {
    id: 'batch-11',
    clinic_id: 'cl-03',
    item_id: 'item-09', // Paracetamol
    batch_number: 'PCM-26F70',
    quantity: 320,
    expiry_date: '2028-01-15', // (GREEN)
    equipment_id: null,
    updated_at: '2026-10-12T09:15:00Z',
  },
  {
    id: 'batch-12',
    clinic_id: 'cl-04',
    item_id: 'item-02', // Rabies
    batch_number: 'RAB-26G04',
    quantity: 40,
    expiry_date: '2027-11-20', // (GREEN)
    equipment_id: 'eq-05',
    updated_at: '2026-10-15T16:20:00Z',
  },
];

export const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: 'req-01',
    requisition_number: 'REQ-2026-0042',
    clinic_id: 'cl-01',
    status: 'PENDING',
    note: 'Urgent resupply for MCH delivery room ahead of rainy season road closures.',
    created_at: '2026-10-15T09:15:00Z',
    updated_at: '2026-10-15T09:15:00Z',
    lines: [
      { id: 'reql-01', requisition_id: 'req-01', item_id: 'item-01', requested_qty: 200, approved_qty: 150 },
      { id: 'reql-02', requisition_id: 'req-01', item_id: 'item-02', requested_qty: 50, approved_qty: 30 },
      { id: 'reql-03', requisition_id: 'req-01', item_id: 'item-05', requested_qty: 100, approved_qty: null },
      { id: 'reql-04', requisition_id: 'req-01', item_id: 'item-08', requested_qty: 300, approved_qty: 300 },
    ],
  },
  {
    id: 'req-02',
    requisition_number: 'REQ-2026-0041',
    clinic_id: 'cl-02',
    status: 'APPROVED',
    note: 'Approved by Dr. Kyaw. Pharmacy preparing boxes for morning car dispatch.',
    created_at: '2026-10-14T14:30:00Z',
    updated_at: '2026-10-15T08:00:00Z',
    lines: [
      { id: 'reql-05', requisition_id: 'req-02', item_id: 'item-06', requested_qty: 150, approved_qty: 150 },
      { id: 'reql-06', requisition_id: 'req-02', item_id: 'item-07', requested_qty: 80, approved_qty: 60 },
      { id: 'reql-07', requisition_id: 'req-02', item_id: 'item-09', requested_qty: 200, approved_qty: 200 },
    ],
  },
  {
    id: 'req-03',
    requisition_number: 'REQ-2026-0039',
    clinic_id: 'cl-04',
    status: 'FULFILLED',
    note: 'Delivered by car on Tuesday by Nurse Somchai. Received and verified on site.',
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-13T16:00:00Z',
    lines: [
      { id: 'reql-08', requisition_id: 'req-03', item_id: 'item-01', requested_qty: 100, approved_qty: 100 },
      { id: 'reql-09', requisition_id: 'req-03', item_id: 'item-03', requested_qty: 40, approved_qty: 40 },
      { id: 'reql-10', requisition_id: 'req-03', item_id: 'item-08', requested_qty: 250, approved_qty: 250 },
    ],
  },
  {
    id: 'req-04',
    requisition_number: 'REQ-2026-0038',
    clinic_id: 'cl-03',
    status: 'APPROVED',
    note: 'Routine monthly requisition. To be picked up by clinical transport truck Friday.',
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-13T09:00:00Z',
    lines: [
      { id: 'reql-11', requisition_id: 'req-04', item_id: 'item-05', requested_qty: 120, approved_qty: 100 },
      { id: 'reql-12', requisition_id: 'req-04', item_id: 'item-10', requested_qty: 50, approved_qty: 50 },
    ],
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-01',
    clinic_id: 'cl-01',
    period_type: 'WEEKLY',
    period_start: '2026-10-07T00:00:00Z',
    period_end: '2026-10-14T00:00:00Z',
    submitted_at: '2026-10-14T08:30:00Z',
    received_at: '2026-10-14T08:31:00Z',
    lines: [
      { id: 'repl-01', report_id: 'rep-01', item_id: 'item-01', batch_number: 'OXY-24B09', expiry_date: '2026-11-20', quantity_on_hand: 140, quantity_used: 42 },
      { id: 'repl-02', report_id: 'rep-01', item_id: 'item-03', batch_number: 'INS-25H02', expiry_date: '2027-02-15', quantity_on_hand: 45, quantity_used: 18 },
      { id: 'repl-03', report_id: 'rep-01', item_id: 'item-05', batch_number: 'AMX-26A01', expiry_date: '2027-08-31', quantity_on_hand: 250, quantity_used: 85 },
      { id: 'repl-04', report_id: 'rep-01', item_id: 'item-08', batch_number: 'ORS-26C15', expiry_date: '2028-04-30', quantity_on_hand: 400, quantity_used: 120 },
    ],
  },
  {
    id: 'rep-02',
    clinic_id: 'cl-02',
    period_type: 'WEEKLY',
    period_start: '2026-10-08T00:00:00Z',
    period_end: '2026-10-15T00:00:00Z',
    submitted_at: '2026-10-15T11:45:00Z',
    received_at: '2026-10-15T11:46:00Z',
    lines: [
      { id: 'repl-05', report_id: 'rep-02', item_id: 'item-02', batch_number: 'RAB-25A14', expiry_date: '2026-12-05', quantity_on_hand: 35, quantity_used: 15 },
      { id: 'repl-06', report_id: 'rep-02', item_id: 'item-01', batch_number: 'OXY-26E03', expiry_date: '2027-10-15', quantity_on_hand: 180, quantity_used: 30 },
      { id: 'repl-07', report_id: 'rep-02', item_id: 'item-04', batch_number: 'OPV-26B22', expiry_date: '2027-09-10', quantity_on_hand: 65, quantity_used: 25 },
    ],
  },
  {
    id: 'rep-03',
    clinic_id: 'cl-03',
    period_type: 'MONTHLY',
    period_start: '2026-09-01T00:00:00Z',
    period_end: '2026-09-30T23:59:59Z',
    submitted_at: '2026-10-02T10:00:00Z',
    received_at: '2026-10-02T10:05:00Z',
    lines: [
      { id: 'repl-08', report_id: 'rep-03', item_id: 'item-07', batch_number: 'CEF-24X88', expiry_date: '2026-11-01', quantity_on_hand: 60, quantity_used: 95 },
      { id: 'repl-09', report_id: 'rep-03', item_id: 'item-09', batch_number: 'PCM-26F70', expiry_date: '2028-01-15', quantity_on_hand: 320, quantity_used: 280 },
    ],
  },
  {
    id: 'rep-04',
    clinic_id: 'cl-04',
    period_type: 'WEEKLY',
    period_start: '2026-10-08T00:00:00Z',
    period_end: '2026-10-15T00:00:00Z',
    submitted_at: '2026-10-15T16:20:00Z',
    received_at: '2026-10-15T16:22:00Z',
    lines: [
      { id: 'repl-10', report_id: 'rep-04', item_id: 'item-06', batch_number: 'ALM-25D11', expiry_date: '2027-03-25', quantity_on_hand: 110, quantity_used: 48 },
      { id: 'repl-11', report_id: 'rep-04', item_id: 'item-02', batch_number: 'RAB-26G04', expiry_date: '2027-11-20', quantity_on_hand: 40, quantity_used: 12 },
    ],
  },
];

export const INITIAL_TEMPERATURE_LOGS: TemperatureLog[] = [
  // eq-01 (Mae La Main Fridge - safe 2-8°C)
  { id: 'tlog-01', clinic_id: 'cl-01', equipment_id: 'eq-01', temperature: 4.2, min_temp: 3.5, max_temp: 5.1, logged_at: '2026-10-15T23:00:00Z', logged_by: 'Nurse Lah Lah', notes: 'Morning check. Power steady.' },
  { id: 'tlog-02', clinic_id: 'cl-01', equipment_id: 'eq-01', temperature: 4.5, min_temp: 3.8, max_temp: 5.4, logged_at: '2026-10-15T11:00:00Z', logged_by: 'Nurse Lah Lah', notes: 'Afternoon reading.' },
  { id: 'tlog-03', clinic_id: 'cl-01', equipment_id: 'eq-01', temperature: 3.9, min_temp: 3.2, max_temp: 4.8, logged_at: '2026-10-14T23:00:00Z', logged_by: 'Medic Saw Moo', notes: 'Normal operation.' },
  { id: 'tlog-04', clinic_id: 'cl-01', equipment_id: 'eq-01', temperature: 4.8, min_temp: 3.7, max_temp: 5.9, logged_at: '2026-10-14T11:00:00Z', logged_by: 'Medic Saw Moo', notes: 'Routine check.' },

  // eq-03 (Wang Pha Fridge - Excursion logged today!)
  { id: 'tlog-05', clinic_id: 'cl-02', equipment_id: 'eq-03', temperature: 9.1, min_temp: 4.2, max_temp: 9.3, logged_at: '2026-10-16T04:15:00Z', logged_by: 'Nurse Lin Lin', notes: 'ALERT: Solar inverter failure during cloudy morning.' },
  { id: 'tlog-06', clinic_id: 'cl-02', equipment_id: 'eq-03', temperature: 6.8, min_temp: 3.9, max_temp: 7.2, logged_at: '2026-10-15T17:00:00Z', logged_by: 'Nurse Lin Lin', notes: 'Evening check.' },
  { id: 'tlog-07', clinic_id: 'cl-02', equipment_id: 'eq-03', temperature: 4.9, min_temp: 3.6, max_temp: 5.5, logged_at: '2026-10-15T05:00:00Z', logged_by: 'Medic Htoo', notes: 'Morning check.' },

  // eq-05 (Mae Tao Outreach Cold Box)
  { id: 'tlog-08', clinic_id: 'cl-04', equipment_id: 'eq-05', temperature: 3.8, min_temp: 2.8, max_temp: 4.5, logged_at: '2026-10-16T05:30:00Z', logged_by: 'Nurse Naw Paw', notes: 'Prepared for riverbank immunization outreach.' },
  { id: 'tlog-09', clinic_id: 'cl-04', equipment_id: 'eq-05', temperature: 4.4, min_temp: 3.1, max_temp: 5.2, logged_at: '2026-10-15T12:00:00Z', logged_by: 'Nurse Naw Paw', notes: 'Return from outreach.' },
];

export const INITIAL_EXCURSIONS: Excursion[] = [
  {
    id: 'exc-01',
    clinic_id: 'cl-02',
    equipment_id: 'eq-03',
    temperature_log_id: 'tlog-05',
    detected_at: '2026-10-16T04:15:00Z',
    severity: 'HIGH',
    duration_minutes: 135,
    action_taken: 'Vaccines and Oxytocin transferred to conditioned cold box with frozen icepacks; local electrician called to inspect inverter fuse.',
    notes: 'Max temp reached 9.3°C. Rabies vaccine and Oxytocin batches temporarily moved to Cold Box WP-CB-01.',
    status: 'OPEN',
  },
  {
    id: 'exc-02',
    clinic_id: 'cl-01',
    equipment_id: 'eq-01',
    detected_at: '2026-10-04T13:20:00Z',
    severity: 'MEDIUM',
    duration_minutes: 85,
    action_taken: 'Door gasket re-aligned, backup generator fuel refilled. Internal temp stabilized within 45 minutes.',
    notes: 'Fridge door left slightly ajar by student nurse. Temperature peaked at 8.7°C. VVM (Vaccine Vial Monitors) checked: all in stage 1, safe to retain.',
    status: 'RESOLVED',
    resolved_by: 'Admin Saidar',
    resolved_at: '2026-10-04T16:00:00Z',
  },
];

export const INITIAL_OUTAGES: OutageLog[] = [
  {
    id: 'out-01',
    clinic_id: 'cl-02',
    equipment_id: 'eq-03',
    type: 'POWER_OUTAGE',
    started_at: '2026-10-16T02:00:00Z',
    ended_at: null,
    notes: 'District grid transformer blown by lightning storm. Solar backup running on low battery.',
  },
  {
    id: 'out-02',
    clinic_id: 'cl-03',
    equipment_id: 'eq-04',
    type: 'EQUIPMENT_FAULT',
    started_at: '2026-10-13T08:00:00Z',
    ended_at: '2026-10-13T14:30:00Z',
    notes: 'Thermostat dial sensor calibrated by biomedical technician from Mae Sot.',
  },
];
