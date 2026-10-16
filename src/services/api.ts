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
    return getStored<Clinic[]>(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
  }

  async saveClinic(clinic: Partial<Clinic> & { name: string; clinic_code: string; location: string }): Promise<Clinic> {
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
    return getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
  }

  async saveItem(item: Partial<Item> & { name: string; unit: string; category: string }): Promise<Item> {
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
    return getStored<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  }

  async saveBatch(batch: Partial<Batch> & { clinic_id: string; item_id: string; batch_number: string; quantity: number; expiry_date: string }): Promise<Batch> {
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
    const batches = await this.getBatches();
    const filtered = batches.filter((b) => b.id !== id);
    setStored(STORAGE_KEYS.BATCHES, filtered);
  }

  // REPORTS
  async getReports(): Promise<Report[]> {
    return getStored<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  async submitReport(report: Report): Promise<Report> {
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
    return getStored<Requisition[]>(STORAGE_KEYS.REQUISITIONS, INITIAL_REQUISITIONS);
  }

  async updateRequisition(
    id: string,
    approvedQuantities: Record<string, number>,
    status: RequisitionStatus,
    note?: string
  ): Promise<Requisition | null> {
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
    const reqs = await this.getRequisitions();
    reqs.unshift(req);
    setStored(STORAGE_KEYS.REQUISITIONS, reqs);
    return req;
  }

  // EQUIPMENT
  async getEquipment(): Promise<Equipment[]> {
    return getStored<Equipment[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  }

  async saveEquipment(eq: Partial<Equipment> & { clinic_id: string; name: string; equipment_code: string }): Promise<Equipment> {
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
    return getStored<TemperatureLog[]>(STORAGE_KEYS.TEMP_LOGS, INITIAL_TEMPERATURE_LOGS);
  }

  async logTemperature(log: TemperatureLog): Promise<{ log: TemperatureLog; excursion?: Excursion }> {
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
    return getStored<Excursion[]>(STORAGE_KEYS.EXCURSIONS, INITIAL_EXCURSIONS);
  }

  async resolveExcursion(id: string, adminNotes: string, resolverName: string = 'Admin'): Promise<Excursion | null> {
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
    return getStored<OutageLog[]>(STORAGE_KEYS.OUTAGES, INITIAL_OUTAGES);
  }

  async logOutage(outage: OutageLog): Promise<OutageLog> {
    const outages = await this.getOutages();
    outages.unshift(outage);
    setStored(STORAGE_KEYS.OUTAGES, outages);
    return outage;
  }

  // Reset to factory defaults
  async resetAllData(): Promise<void> {
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
