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
  RequisitionStatus,
} from '../types';
import {
  INITIAL_CLINICS,
  INITIAL_ITEMS,
  INITIAL_EQUIPMENT,
  INITIAL_BATCHES,
  INITIAL_REQUISITIONS,
  INITIAL_REPORTS,
  INITIAL_TEMPERATURE_LOGS,
  INITIAL_EXCURSIONS,
  INITIAL_OUTAGES,
} from './mockData';

const STORAGE_KEYS = {
  CLINICS: 'shd_data_clinics_v1',
  ITEMS: 'shd_data_items_v1',
  EQUIPMENT: 'shd_data_equipment_v1',
  BATCHES: 'shd_data_batches_v1',
  REQUISITIONS: 'shd_data_requisitions_v1',
  REPORTS: 'shd_data_reports_v1',
  TEMP_LOGS: 'shd_data_templogs_v1',
  EXCURSIONS: 'shd_data_excursions_v1',
  OUTAGES: 'shd_data_outages_v1',
  API_URL: 'shd_msupply_api_url',
};

// Runtime config or storage
export function getApiBaseUrl(): string {
  const custom = localStorage.getItem(STORAGE_KEYS.API_URL);
  if (custom !== null) return custom;
  if (typeof window !== 'undefined' && window.__CONFIG__?.API_BASE_URL) {
    return window.__CONFIG__.API_BASE_URL;
  }
  return '';
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_KEYS.API_URL, url.trim());
}

// Local mock store initialization
function getStored<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ---------------------------------------------------------------------------
// REST mode: when an API base URL is configured, every call goes to the backend.
// With an empty URL the app keeps using the localStorage mock store (offline demo).
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'shd_msupply_session_token';

export function isRestMode(): boolean {
  return getApiBaseUrl().trim() !== '';
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(method: string, path: string, body?: unknown, withAuth = true): Promise<T> {
  const base = getApiBaseUrl().trim().replace(/\/+$/, '');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem(TOKEN_KEY);
  if (withAuth && token) headers.Authorization = `Bearer ${token}`;

  let resp: Response;
  try {
    resp = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, `Cannot reach server (${e instanceof Error ? e.message : String(e)})`);
  }

  if (resp.status === 401 && withAuth) {
    // Session expired or token invalid: drop it and let the app return to the login screen.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('shd_msupply_session_user');
    window.dispatchEvent(new Event('shd:unauthorized'));
  }

  const text = await resp.text();
  let data: any = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!resp.ok) {
    const msg = (data && (data.error || data.message)) || resp.statusText || `HTTP ${resp.status}`;
    throw new ApiError(resp.status, typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data as T;
}

// The backend returns null for missing optional values and may return
// numeric/date columns as strings; the frontend types expect undefined/number/YYYY-MM-DD.
const u = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);
const num = (v: unknown): number => Number(v);
const day = (v: unknown): string => (typeof v === 'string' ? v.slice(0, 10) : (v as string));

const normClinic = (c: any): Clinic => ({ ...c, last_report_date: c.last_report_date ?? c.created_at });
const normItem = (i: any): Item => ({ ...i, reorder_level: num(i.reorder_level) });
const normBatch = (b: any): Batch => ({
  ...b,
  quantity: num(b.quantity),
  expiry_date: day(b.expiry_date),
  equipment_id: b.equipment_id ?? null,
});
const normEquipment = (e: any): Equipment => ({
  ...e,
  min_temp: num(e.min_temp),
  max_temp: num(e.max_temp),
  install_date: day(e.install_date),
  last_reading_temp: e.last_reading_temp === null || e.last_reading_temp === undefined ? undefined : num(e.last_reading_temp),
  last_reading_time: u(e.last_reading_time),
});
const normLog = (l: any): TemperatureLog => ({
  ...l,
  temperature: num(l.temperature),
  min_temp: num(l.min_temp),
  max_temp: num(l.max_temp),
  notes: u(l.notes),
});
const normExcursion = (x: any): Excursion => ({
  ...x,
  duration_minutes: num(x.duration_minutes),
  temperature_log_id: u(x.temperature_log_id),
  notes: u(x.notes),
  resolved_by: u(x.resolved_by),
  resolved_at: u(x.resolved_at),
});
const normOutage = (o: any): OutageLog => ({ ...o, equipment_id: o.equipment_id ?? null, ended_at: o.ended_at ?? null });
const normReport = (r: any): Report => ({
  ...r,
  period_start: day(r.period_start),
  period_end: day(r.period_end),
  lines: (r.lines || []).map((l: any) => ({
    ...l,
    expiry_date: day(l.expiry_date),
    quantity_on_hand: num(l.quantity_on_hand),
    quantity_used: num(l.quantity_used),
  })),
});
const normRequisition = (r: any): Requisition => ({
  ...r,
  note: u(r.note),
  lines: (r.lines || []).map((l: any) => ({
    ...l,
    requested_qty: num(l.requested_qty),
    approved_qty: l.approved_qty === null || l.approved_qty === undefined ? null : num(l.approved_qty),
  })),
});

class ApiService {
  // Test connection to real REST backend
  async testConnection(url: string): Promise<{ ok: boolean; message: string; latency?: number }> {
    const target = url.trim().replace(/\/+$/, '');
    if (!target) {
      return { ok: true, message: 'Using internal offline-capable storage engine (Local Mock Store).' };
    }

    const start = performance.now();
    try {
      const resp = await fetch(`${target}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const latency = Math.round(performance.now() - start);
      if (resp.ok) {
        return { ok: true, message: `Connected successfully to ${target} (${latency}ms).`, latency };
      }
      return { ok: false, message: `Server returned status ${resp.status}: ${resp.statusText}` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        message: `Could not connect to ${target} (${message}). Check CORS or Cloudflare Tunnel status.`,
      };
    }
  }

  // CLINICS
  async getClinics(): Promise<Clinic[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/clinics')).map(normClinic);
    return getStored<Clinic[]>(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
  }

  async saveClinic(clinic: Partial<Clinic> & { name: string; clinic_code: string; location: string }): Promise<Clinic> {
    if (isRestMode()) {
      const res = clinic.id
        ? await request<any>('PUT', `/clinics/${clinic.id}`, clinic)
        : await request<any>('POST', '/clinics', clinic);
      return normClinic(res);
    }
    const clinics = await this.getClinics();
    if (clinic.id) {
      const idx = clinics.findIndex((c) => c.id === clinic.id);
      if (idx >= 0) {
        clinics[idx] = { ...clinics[idx], ...clinic };
        setStored(STORAGE_KEYS.CLINICS, clinics);
        return clinics[idx];
      }
    }
    const newClinic: Clinic = {
      id: clinic.id || 'cl-' + Math.random().toString(36).substring(2, 9),
      clinic_code: clinic.clinic_code.toUpperCase(),
      name: clinic.name,
      location: clinic.location,
      last_report_date: new Date().toISOString(),
      active: clinic.active ?? true,
      created_at: new Date().toISOString(),
    };
    clinics.unshift(newClinic);
    setStored(STORAGE_KEYS.CLINICS, clinics);
    return newClinic;
  }

  // ITEMS
  async getItems(): Promise<Item[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/items')).map(normItem);
    return getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
  }

  async saveItem(item: Partial<Item> & { name: string; unit: string; category: string }): Promise<Item> {
    if (isRestMode()) {
      const res = item.id
        ? await request<any>('PUT', `/items/${item.id}`, item)
        : await request<any>('POST', '/items', item);
      return normItem(res);
    }
    const items = await this.getItems();
    if (item.id) {
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...item };
        setStored(STORAGE_KEYS.ITEMS, items);
        return items[idx];
      }
    }
    const newItem: Item = {
      id: item.id || 'item-' + Math.random().toString(36).substring(2, 9),
      name: item.name,
      unit: item.unit,
      category: item.category,
      reorder_level: item.reorder_level ?? 50,
      storage_requirement: item.storage_requirement ?? 'AMBIENT',
      active: item.active ?? true,
    };
    items.unshift(newItem);
    setStored(STORAGE_KEYS.ITEMS, items);
    return newItem;
  }

  // BATCHES
  async getBatches(): Promise<Batch[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/batches')).map(normBatch);
    return getStored<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  }

  async saveBatch(batch: Partial<Batch> & { clinic_id: string; item_id: string; batch_number: string; quantity: number; expiry_date: string }): Promise<Batch> {
    if (isRestMode()) {
      const res = batch.id
        ? await request<any>('PUT', `/batches/${batch.id}`, batch)
        : await request<any>('POST', '/batches', batch);
      return normBatch(res);
    }
    const batches = await this.getBatches();
    if (batch.id) {
      const idx = batches.findIndex((b) => b.id === batch.id);
      if (idx >= 0) {
        batches[idx] = { ...batches[idx], ...batch, updated_at: new Date().toISOString() };
        setStored(STORAGE_KEYS.BATCHES, batches);
        return batches[idx];
      }
    }
    const newBatch: Batch = {
      id: batch.id || 'batch-' + Math.random().toString(36).substring(2, 9),
      clinic_id: batch.clinic_id,
      item_id: batch.item_id,
      batch_number: batch.batch_number.toUpperCase(),
      quantity: Number(batch.quantity),
      expiry_date: batch.expiry_date,
      equipment_id: batch.equipment_id || null,
      updated_at: new Date().toISOString(),
    };
    batches.unshift(newBatch);
    setStored(STORAGE_KEYS.BATCHES, batches);
    return newBatch;
  }

  async deleteBatch(id: string): Promise<void> {
    if (isRestMode()) {
      await request<void>('DELETE', `/batches/${id}`);
      return;
    }
    const batches = await this.getBatches();
    const filtered = batches.filter((b) => b.id !== id);
    setStored(STORAGE_KEYS.BATCHES, filtered);
  }

  // REPORTS
  async getReports(): Promise<Report[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/reports')).map(normReport);
    return getStored<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  async submitReport(report: Report): Promise<Report> {
    // Server updates batch quantities and clinic.last_report_date in one transaction.
    if (isRestMode()) return normReport(await request<any>('POST', '/reports', report));
    const reports = await this.getReports();
    reports.unshift(report);
    setStored(STORAGE_KEYS.REPORTS, reports);

    // Also update clinic last_report_date
    const clinics = await this.getClinics();
    const clinicIdx = clinics.findIndex((c) => c.id === report.clinic_id);
    if (clinicIdx >= 0) {
      clinics[clinicIdx].last_report_date = report.submitted_at;
      setStored(STORAGE_KEYS.CLINICS, clinics);
    }

    // Update batches with report quantities on hand
    const batches = await this.getBatches();
    for (const line of report.lines) {
      const existingBatch = batches.find(
        (b) => b.clinic_id === report.clinic_id && b.batch_number === line.batch_number
      );
      if (existingBatch) {
        existingBatch.quantity = line.quantity_on_hand;
        existingBatch.updated_at = report.submitted_at;
      } else {
        batches.unshift({
          id: 'batch-' + Math.random().toString(36).substring(2, 9),
          clinic_id: report.clinic_id,
          item_id: line.item_id,
          batch_number: line.batch_number,
          quantity: line.quantity_on_hand,
          expiry_date: line.expiry_date,
          equipment_id: null,
          updated_at: report.submitted_at,
        });
      }
    }
    setStored(STORAGE_KEYS.BATCHES, batches);

    return report;
  }

  // REQUISITIONS
  async getRequisitions(): Promise<Requisition[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/requisitions')).map(normRequisition);
    return getStored<Requisition[]>(STORAGE_KEYS.REQUISITIONS, INITIAL_REQUISITIONS);
  }

  async updateRequisition(
    id: string,
    approvedQuantities: Record<string, number>,
    status: RequisitionStatus,
    note?: string
  ): Promise<Requisition | null> {
    if (isRestMode()) {
      try {
        const res = await request<any>('PATCH', `/requisitions/${id}`, {
          approved_quantities: approvedQuantities,
          status,
          note,
        });
        return normRequisition(res);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    }
    const reqs = await this.getRequisitions();
    const idx = reqs.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = reqs[idx];
    const updatedLines = current.lines.map((line) => {
      const approved = approvedQuantities[line.id] !== undefined ? approvedQuantities[line.id] : line.approved_qty;
      return {
        ...line,
        approved_qty: approved,
      };
    });

    const updated: Requisition = {
      ...current,
      status,
      note: note !== undefined ? note : current.note,
      lines: updatedLines,
      updated_at: new Date().toISOString(),
    };

    reqs[idx] = updated;
    setStored(STORAGE_KEYS.REQUISITIONS, reqs);
    return updated;
  }

  async createRequisition(req: Requisition): Promise<Requisition> {
    if (isRestMode()) return normRequisition(await request<any>('POST', '/requisitions', req));
    const reqs = await this.getRequisitions();
    reqs.unshift(req);
    setStored(STORAGE_KEYS.REQUISITIONS, reqs);
    return req;
  }

  // EQUIPMENT
  async getEquipment(): Promise<Equipment[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/equipment')).map(normEquipment);
    return getStored<Equipment[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  }

  async saveEquipment(eq: Partial<Equipment> & { clinic_id: string; name: string; equipment_code: string }): Promise<Equipment> {
    if (isRestMode()) {
      const res = eq.id
        ? await request<any>('PUT', `/equipment/${eq.id}`, eq)
        : await request<any>('POST', '/equipment', eq);
      return normEquipment(res);
    }
    const list = await this.getEquipment();
    if (eq.id) {
      const idx = list.findIndex((e) => e.id === eq.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...eq };
        setStored(STORAGE_KEYS.EQUIPMENT, list);
        return list[idx];
      }
    }
    const newEq: Equipment = {
      id: eq.id || 'eq-' + Math.random().toString(36).substring(2, 9),
      clinic_id: eq.clinic_id,
      equipment_code: eq.equipment_code.toUpperCase(),
      type: eq.type || 'FRIDGE',
      name: eq.name,
      location: eq.location || 'Main Storage',
      model: eq.model || 'Standard WHO PQS',
      install_date: eq.install_date || new Date().toISOString().slice(0, 10),
      min_temp: eq.min_temp ?? 2.0,
      max_temp: eq.max_temp ?? 8.0,
      status: eq.status || 'ACTIVE',
      last_reading_temp: eq.last_reading_temp,
      last_reading_time: eq.last_reading_time,
    };
    list.unshift(newEq);
    setStored(STORAGE_KEYS.EQUIPMENT, list);
    return newEq;
  }

  // TEMPERATURE LOGS
  async getTemperatureLogs(): Promise<TemperatureLog[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/temperature-logs')).map(normLog);
    return getStored<TemperatureLog[]>(STORAGE_KEYS.TEMP_LOGS, INITIAL_TEMPERATURE_LOGS);
  }

  async logTemperature(log: TemperatureLog): Promise<{ log: TemperatureLog; excursion?: Excursion }> {
    // Excursion detection happens on the server; the response may be the log or { log, excursion }.
    if (isRestMode()) {
      const res = await request<any>('POST', '/temperature-logs', log);
      const rawLog = res && res.log ? res.log : res;
      return {
        log: normLog(rawLog),
        excursion: res && res.excursion ? normExcursion(res.excursion) : undefined,
      };
    }
    const logs = await this.getTemperatureLogs();
    logs.unshift(log);
    setStored(STORAGE_KEYS.TEMP_LOGS, logs);

    // Update equipment's last reading
    const equipment = await this.getEquipment();
    const eqIdx = equipment.findIndex((e) => e.id === log.equipment_id);
    let excursion: Excursion | undefined;

    if (eqIdx >= 0) {
      const eq = equipment[eqIdx];
      eq.last_reading_temp = log.temperature;
      eq.last_reading_time = log.logged_at;
      setStored(STORAGE_KEYS.EQUIPMENT, equipment);

      // Check if excursion occurred:
      // Either current temp is outside safe limits or min/max reached outside safe bounds
      const minBreach = log.temperature < eq.min_temp || log.min_temp < eq.min_temp;
      const maxBreach = log.temperature > eq.max_temp || log.max_temp > eq.max_temp;

      if (minBreach || maxBreach) {
        const severity = (log.temperature > eq.max_temp + 3 || log.temperature < eq.min_temp - 5)
          ? 'HIGH'
          : 'MEDIUM';

        excursion = {
          id: 'exc-' + Math.random().toString(36).substring(2, 9),
          clinic_id: log.clinic_id,
          equipment_id: log.equipment_id,
          temperature_log_id: log.id,
          detected_at: log.logged_at,
          severity,
          duration_minutes: 60,
          action_taken: 'Excursion detected from incoming clinic temperature report.',
          notes: log.notes || `Reading: ${log.temperature}°C (Limit: ${eq.min_temp}°C - ${eq.max_temp}°C)`,
          status: 'OPEN',
        };

        const excursions = await this.getExcursions();
        excursions.unshift(excursion);
        setStored(STORAGE_KEYS.EXCURSIONS, excursions);
      }
    }

    return { log, excursion };
  }

  // EXCURSIONS
  async getExcursions(): Promise<Excursion[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/excursions')).map(normExcursion);
    return getStored<Excursion[]>(STORAGE_KEYS.EXCURSIONS, INITIAL_EXCURSIONS);
  }

  async resolveExcursion(id: string, adminNotes: string, resolverName: string = 'Admin'): Promise<Excursion | null> {
    // Resolver identity comes from the JWT on the server, so resolverName is ignored here.
    if (isRestMode()) {
      try {
        return normExcursion(await request<any>('POST', `/excursions/${id}/resolve`, { notes: adminNotes }));
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    }
    const excursions = await this.getExcursions();
    const idx = excursions.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    excursions[idx] = {
      ...excursions[idx],
      status: 'RESOLVED',
      notes: excursions[idx].notes ? `${excursions[idx].notes} | Admin resolution: ${adminNotes}` : adminNotes,
      resolved_by: resolverName,
      resolved_at: new Date().toISOString(),
    };

    setStored(STORAGE_KEYS.EXCURSIONS, excursions);
    return excursions[idx];
  }

  // OUTAGES
  async getOutages(): Promise<OutageLog[]> {
    if (isRestMode()) return (await request<any[]>('GET', '/outages')).map(normOutage);
    return getStored<OutageLog[]>(STORAGE_KEYS.OUTAGES, INITIAL_OUTAGES);
  }

  async logOutage(outage: OutageLog): Promise<OutageLog> {
    if (isRestMode()) return normOutage(await request<any>('POST', '/outages', outage));
    const outages = await this.getOutages();
    outages.unshift(outage);
    setStored(STORAGE_KEYS.OUTAGES, outages);
    return outage;
  }

  // Reset to factory defaults
  async resetAllData(): Promise<void> {
    if (isRestMode()) {
      throw new Error('Sample-data reset only applies to the local demo store. Clear the API URL in Settings to use it.');
    }
    localStorage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(INITIAL_CLINICS));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
    localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(INITIAL_REQUISITIONS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(STORAGE_KEYS.TEMP_LOGS, JSON.stringify(INITIAL_TEMPERATURE_LOGS));
    localStorage.setItem(STORAGE_KEYS.EXCURSIONS, JSON.stringify(INITIAL_EXCURSIONS));
    localStorage.setItem(STORAGE_KEYS.OUTAGES, JSON.stringify(INITIAL_OUTAGES));
  }
}

export const api = new ApiService();
