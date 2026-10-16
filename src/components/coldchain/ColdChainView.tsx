import { useState, useMemo, useId } from 'react';
import {
  ThermometerSnowflake,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Printer,
  Calendar,
  Building2,
  ZapOff,
  Wrench,
  Search,
  Filter,
  Check,
  ChevronRight,
  TrendingDown,
  Info,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  Equipment,
  Clinic,
  TemperatureLog,
  Excursion,
  OutageLog,
  Batch,
  Item,
  EquipmentType,
  EquipmentStatus,
} from '../../types';
import { formatDateTime, formatDate, getSelectedTimezone } from '../../services/time';
import { api } from '../../services/api';

interface ColdChainViewProps {
  equipment: Equipment[];
  clinics: Clinic[];
  temperatureLogs: TemperatureLog[];
  excursions: Excursion[];
  outages: OutageLog[];
  batches: Batch[];
  items: Item[];
  onRefresh: () => void;
}

export function ColdChainView({
  equipment,
  clinics,
  temperatureLogs,
  excursions,
  outages,
  batches,
  items,
  onRefresh,
}: ColdChainViewProps) {
  const chartEquipmentSelectId = useId();
  const searchLogsInputId = useId();
  const eqClinicSelectId = useId();
  const eqCodeInputId = useId();
  const eqTypeSelectId = useId();
  const eqNameInputId = useId();
  const eqLocationInputId = useId();
  const eqModelInputId = useId();
  const eqMinTempInputId = useId();
  const eqMaxTempInputId = useId();
  const eqStatusSelectId = useId();
  const excursionNotesId = useId();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'equipment' | 'chart' | 'logs' | 'excursions' | 'outages'
  >('overview');

  // Chart equipment selector
  const [selectedChartEqId, setSelectedChartEqId] = useState<string>(
    equipment[0]?.id || ''
  );

  // Equipment add/edit modal
  const [isEqModalOpen, setIsEqModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [eqClinicId, setEqClinicId] = useState(clinics[0]?.id || '');
  const [eqCode, setEqCode] = useState('');
  const [eqType, setEqType] = useState<EquipmentType>('FRIDGE');
  const [eqName, setEqName] = useState('');
  const [eqLocation, setEqLocation] = useState('');
  const [eqModel, setEqModel] = useState('');
  const [eqMinTemp, setEqMinTemp] = useState(2.0);
  const [eqMaxTemp, setEqMaxTemp] = useState(8.0);
  const [eqStatus, setEqStatus] = useState<EquipmentStatus>('ACTIVE');
  const [savingEq, setSavingEq] = useState(false);

  // Excursion resolution modal
  const [resolvingExcursion, setResolvingExcursion] = useState<Excursion | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // Stock at risk modal
  const [inspectedExcursion, setInspectedExcursion] = useState<Excursion | null>(null);

  // Print temperature log sheet state
  const [printEquipment, setPrintEquipment] = useState<Equipment | null>(null);

  // Compute overdue equipment (>12 hours without reading)
  const now = new Date().getTime();
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  const equipmentWithStatus = equipment.map((eq) => {
    const isExcursion = excursions.some(
      (exc) => exc.equipment_id === eq.id && exc.status === 'OPEN'
    );
    const lastReadingTime = eq.last_reading_time ? new Date(eq.last_reading_time).getTime() : 0;
    const isOverdue = eq.status === 'ACTIVE' && now - lastReadingTime > TWELVE_HOURS_MS;

    let condition: 'SAFE' | 'EXCURSION' | 'OVERDUE' | 'RETIRED' = 'SAFE';
    if (eq.status === 'RETIRED') condition = 'RETIRED';
    else if (isExcursion) condition = 'EXCURSION';
    else if (isOverdue) condition = 'OVERDUE';

    return {
      ...eq,
      condition,
      isOverdue,
      isExcursion,
    };
  });

  const activeUnits = equipmentWithStatus.filter((e) => e.status === 'ACTIVE');
  const safeCount = activeUnits.filter((e) => e.condition === 'SAFE').length;
  const excursionCount = activeUnits.filter((e) => e.condition === 'EXCURSION').length;
  const overdueCount = activeUnits.filter((e) => e.condition === 'OVERDUE').length;

  // Chart data for selected equipment
  const selectedChartEq = equipment.find((e) => e.id === selectedChartEqId);
  const chartData = useMemo(() => {
    if (!selectedChartEq) return [];
    const eqLogs = temperatureLogs
      .filter((l) => l.equipment_id === selectedChartEq.id)
      .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

    return eqLogs.map((log) => ({
      timestamp: formatDateTime(log.logged_at),
      timeShort: log.logged_at.slice(11, 16),
      temperature: log.temperature,
      minTemp: log.min_temp,
      maxTemp: log.max_temp,
      safeMin: selectedChartEq.min_temp,
      safeMax: selectedChartEq.max_temp,
      loggedBy: log.logged_by,
    }));
  }, [selectedChartEq, temperatureLogs]);

  const openAddEquipment = () => {
    setEditingEq(null);
    setEqClinicId(clinics[0]?.id || '');
    setEqCode(`FR-0${equipment.length + 1}`);
    setEqType('FRIDGE');
    setEqName('');
    setEqLocation('');
    setEqModel('Vestfrost VLS 024 SD');
    setEqMinTemp(2.0);
    setEqMaxTemp(8.0);
    setEqStatus('ACTIVE');
    setIsEqModalOpen(true);
  };

  const openEditEquipment = (eq: Equipment) => {
    setEditingEq(eq);
    setEqClinicId(eq.clinic_id);
    setEqCode(eq.equipment_code);
    setEqType(eq.type);
    setEqName(eq.name);
    setEqLocation(eq.location);
    setEqModel(eq.model);
    setEqMinTemp(eq.min_temp);
    setEqMaxTemp(eq.max_temp);
    setEqStatus(eq.status);
    setIsEqModalOpen(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEq(true);
    try {
      await api.saveEquipment({
        id: editingEq ? editingEq.id : undefined,
        clinic_id: eqClinicId,
        equipment_code: eqCode.trim().toUpperCase(),
        type: eqType,
        name: eqName.trim(),
        location: eqLocation.trim(),
        model: eqModel.trim(),
        min_temp: Number(eqMinTemp),
        max_temp: Number(eqMaxTemp),
        status: eqStatus,
      });
      setIsEqModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save equipment:', err);
    } finally {
      setSavingEq(false);
    }
  };

  const handleResolveExcursion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingExcursion) return;
    setResolving(true);
    try {
      await api.resolveExcursion(resolvingExcursion.id, resolutionNotes);
      setResolvingExcursion(null);
      setResolutionNotes('');
      onRefresh();
    } catch (err) {
      console.error('Failed to resolve excursion:', err);
    } finally {
      setResolving(false);
    }
  };

  // Get stock at risk for a specific excursion
  const getStockAtRisk = (excursion: Excursion) => {
    return batches.filter((b) => b.equipment_id === excursion.equipment_id);
  };

  return (
    <div className="space-y-6">
      {/* Print View for Temperature Log Sheet (WHO / PQS Format) */}
      {printEquipment && (
        <div className="print-only print-container font-sans text-black">
          <div className="border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  SHD M Supply • Cold Chain Temperature Log Sheet
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Standard WHO PQS Twice-Daily Monitoring Sheet & Audit Verification
                </p>
              </div>
              <div className="text-right text-xs font-mono">
                <div className="font-bold text-sm">{printEquipment.equipment_code}</div>
                <div>Target: {printEquipment.min_temp}°C to {printEquipment.max_temp}°C</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-300 text-xs">
              <div>
                <div>
                  <span className="font-bold">Clinic: </span>
                  {clinics.find((c) => c.id === printEquipment.clinic_id)?.name}
                </div>
                <div>
                  <span className="font-bold">Unit Name & Model: </span>
                  {printEquipment.name} ({printEquipment.model})
                </div>
                <div>
                  <span className="font-bold">Location: </span>
                  {printEquipment.location}
                </div>
              </div>
              <div className="text-right">
                <div>
                  <span className="font-bold">Generated: </span>
                  <span className="font-mono">
                    {formatDateTime(new Date().toISOString(), { includeSeconds: true })}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Timezone: </span>
                  <span className="font-mono">{getSelectedTimezone()}</span>
                </div>
                <div>
                  <span className="font-bold">Expected Interval: </span>
                  <span>Twice daily (08:00 & 16:00)</span>
                </div>
              </div>
            </div>
          </div>

          <table className="w-full text-left text-xs mb-8">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100">
                <th className="py-2 px-3">Date & Time</th>
                <th className="py-2 px-3 text-right">Current Temp (°C)</th>
                <th className="py-2 px-3 text-right">Min Temp</th>
                <th className="py-2 px-3 text-right">Max Temp</th>
                <th className="py-2 px-3">Recorded By</th>
                <th className="py-2 px-3">Status / Excursion Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {temperatureLogs
                .filter((l) => l.equipment_id === printEquipment.id)
                .map((log) => {
                  const isBreach =
                    log.temperature < printEquipment.min_temp ||
                    log.temperature > printEquipment.max_temp;
                  return (
                    <tr key={log.id}>
                      <td className="py-2 px-3 font-mono">{formatDateTime(log.logged_at)}</td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${isBreach ? 'text-red-600' : ''}`}>
                        {log.temperature}°C
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{log.min_temp}°C</td>
                      <td className="py-2 px-3 text-right font-mono">{log.max_temp}°C</td>
                      <td className="py-2 px-3">{log.logged_by}</td>
                      <td className="py-2 px-3">
                        {isBreach ? (
                          <span className="font-bold text-red-600">
                            EXCURSION: {log.notes || 'Breached safe threshold'}
                          </span>
                        ) : (
                          'Normal / In Safe Range'
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-300 text-xs">
            <div>
              <div className="font-bold mb-6">Clinic Cold Chain Officer Signature:</div>
              <div className="border-b border-slate-400 mb-1" />
              <div className="text-slate-500 text-[10px]">Name & Date</div>
            </div>
            <div>
              <div className="font-bold mb-6">Central Pharmacy Supervisor Audit:</div>
              <div className="border-b border-slate-400 mb-1" />
              <div className="text-slate-500 text-[10px]">Verified & Filed</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ThermometerSnowflake className="w-5 h-5 text-teal-600" />
              <span>Cold Chain Monitoring Module</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive telemetry for fridges, freezers, temperature excursions, and cold-chain stock at risk
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddEquipment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Equipment</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold bg-teal-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Overview & Registry</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {equipment.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chart'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold bg-teal-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Temperature Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold bg-teal-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Reading Logs</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {temperatureLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excursions')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'excursions'
                ? 'border-b-2 border-rose-600 text-rose-700 font-bold bg-rose-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Excursions & Stock at Risk</span>
            {excursions.filter((e) => e.status === 'OPEN').length > 0 && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                {excursions.filter((e) => e.status === 'OPEN').length} active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outages')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'outages'
                ? 'border-b-2 border-amber-600 text-amber-700 font-bold bg-amber-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Power & Outage Logs</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {outages.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & EQUIPMENT REGISTRY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Breakdown Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    In Safe Range
                  </span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">{safeCount} units</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Operating normally</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Active Excursions
                  </span>
                  <div className="text-2xl font-bold text-rose-700 mt-1">{excursionCount} units</div>
                  <div className="text-[11px] text-rose-600 font-medium mt-0.5">Requires intervention</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Missed Readings (&gt;12h)
                  </span>
                  <div className="text-2xl font-bold text-amber-700 mt-1">{overdueCount} units</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Overdue periodic checks</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Equipment Registry Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">
                  Equipment Registry (Refrigerators, Freezers & Cold Boxes)
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {equipment.length} units registered
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Code & Name</th>
                      <th className="py-3 px-4">Clinic & Location</th>
                      <th className="py-3 px-4">Type & Model</th>
                      <th className="py-3 px-4">Safe Storage Range</th>
                      <th className="py-3 px-4">Latest Reading</th>
                      <th className="py-3 px-4">Condition</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {equipmentWithStatus.map((eq) => {
                      const clinic = clinics.find((c) => c.id === eq.clinic_id);

                      let badge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Safe
                        </span>
                      );

                      if (eq.condition === 'EXCURSION') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            Excursion
                          </span>
                        );
                      } else if (eq.condition === 'OVERDUE') {
                        badge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3" />
                            Overdue
                          </span>
                        );
                      } else if (eq.condition === 'RETIRED') {
                        badge = (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500">
                            Retired
                          </span>
                        );
                      }

                      return (
                        <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                                {eq.equipment_code}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{eq.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  Installed: {formatDate(eq.install_date)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{clinic?.name}</div>
                            <div className="text-[11px] text-slate-500">{eq.location}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-700">{eq.type}</span>
                            <div className="text-[10px] text-slate-400">{eq.model}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">
                            {eq.min_temp}°C &rarr; {eq.max_temp}°C
                          </td>
                          <td className="py-3.5 px-4">
                            {eq.last_reading_temp !== undefined ? (
                              <div>
                                <span
                                  className={`font-mono font-bold text-sm ${
                                    eq.condition === 'EXCURSION'
                                      ? 'text-rose-600'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {eq.last_reading_temp}°C
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {formatDateTime(eq.last_reading_time)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">{badge}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedChartEqId(eq.id);
                                  setActiveTab('chart');
                                }}
                                className="px-2 py-1 text-xs text-teal-700 hover:bg-teal-50 rounded font-medium transition-colors cursor-pointer"
                                title="View Temperature Chart"
                              >
                                Chart
                              </button>
                              <button
                                type="button"
                                onClick={() => setPrintEquipment(eq)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Print WHO Monthly/Weekly Log Sheet"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditEquipment(eq)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Unit"
                              >
                                <Wrench className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPERATURE CHARTS WITH SHADED SAFE BAND */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label
                  htmlFor={chartEquipmentSelectId}
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Select Cold Chain Unit:
                </label>
                <select
                  id={chartEquipmentSelectId}
                  value={selectedChartEqId}
                  onChange={(e) => setSelectedChartEqId(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                >
                  {equipment.map((eq) => {
                    const clinic = clinics.find((c) => c.id === eq.clinic_id);
                    return (
                      <option key={eq.id} value={eq.id}>
                        {eq.equipment_code} - {eq.name} ({clinic?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedChartEq && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                    Safe Band: {selectedChartEq.min_temp}°C to {selectedChartEq.max_temp}°C
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrintEquipment(selectedChartEq)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Log Sheet</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recharts Container */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 text-sm">
                  Continuous Temperature Trend & Safe Range Shading
                </h4>
                <p className="text-xs text-slate-500">
                  Green shaded band illustrates WHO recommended storage boundaries. Points outside the band indicate excursions.
                </p>
              </div>

              {chartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
                  No readings recorded yet for this equipment.
                </div>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="timeShort"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        label={{ value: 'Time (Hours:Minutes)', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        domain={[
                          (dataMin: number) => Math.min(Math.floor(dataMin - 1), (selectedChartEq?.min_temp || 0) - 2),
                          (dataMax: number) => Math.max(Math.ceil(dataMax + 1), (selectedChartEq?.max_temp || 8) + 2),
                        ]}
                        unit="°C"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '12px',
                          border: 'none',
                        }}
                      />
                      {/* Shaded Safe Storage Band */}
                      {selectedChartEq && (
                        <ReferenceArea
                          y1={selectedChartEq.min_temp}
                          y2={selectedChartEq.max_temp}
                          fill="#10b981"
                          fillOpacity={0.12}
                        />
                      )}
                      {selectedChartEq && (
                        <ReferenceLine
                          y={selectedChartEq.max_temp}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          label={{ value: `Max Limit (${selectedChartEq.max_temp}°C)`, fill: '#ef4444', fontSize: 10 }}
                        />
                      )}
                      {selectedChartEq && (
                        <ReferenceLine
                          y={selectedChartEq.min_temp}
                          stroke="#3b82f6"
                          strokeDasharray="4 4"
                          label={{ value: `Min Limit (${selectedChartEq.min_temp}°C)`, fill: '#3b82f6', fontSize: 10 }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0d9488' }}
                        activeDot={{ r: 6 }}
                        name="Temperature (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: READING LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">
                Submitted Temperature Readings Log
              </h3>
              <div className="relative max-w-xs">
                <label htmlFor={searchLogsInputId} className="sr-only">Search logs</label>
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id={searchLogsInputId}
                  type="text"
                  placeholder="Filter logs..."
                  className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Clinic & Equipment</th>
                    <th className="py-3 px-4 text-right">Current Temp</th>
                    <th className="py-3 px-4 text-right">Min / Max Since Last</th>
                    <th className="py-3 px-4">Logged By</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {temperatureLogs.map((log) => {
                    const eq = equipment.find((e) => e.id === log.equipment_id);
                    const clinic = clinics.find((c) => c.id === log.clinic_id);
                    const isExcursion =
                      eq && (log.temperature < eq.min_temp || log.temperature > eq.max_temp);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {formatDateTime(log.logged_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{eq?.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {clinic?.name} ({eq?.equipment_code})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isExcursion ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {log.temperature}°C
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {log.min_temp}°C / {log.max_temp}°C
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.logged_by}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EXCURSIONS & STOCK AT RISK */}
        {activeTab === 'excursions' && (
          <div className="space-y-6">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Temperature Excursion & Quarantine Protocol</h4>
                <p className="mt-1 leading-relaxed text-rose-800">
                  Excursions occur when readings violate safe boundaries (2-8°C for vaccines). Each excursion shows the clinic’s immediate response, duration, and all cold-chain batches housed within that unit to prevent degraded pharmaceuticals from reaching patients.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Recorded Excursions</h3>
                <span className="text-xs text-slate-500">{excursions.length} total events</span>
              </div>

              <div className="divide-y divide-slate-100">
                {excursions.map((exc) => {
                  const eq = equipment.find((e) => e.id === exc.equipment_id);
                  const clinic = clinics.find((c) => c.id === exc.clinic_id);
                  const atRiskBatches = getStockAtRisk(exc);

                  return (
                    <div key={exc.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                exc.severity === 'HIGH' || exc.severity === 'CRITICAL'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {exc.severity} Severity
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {eq?.name} ({eq?.equipment_code})
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-teal-700">{clinic?.name}</span>
                          </div>

                          <div className="text-xs text-slate-500 mt-1 font-mono">
                            Detected: {formatDateTime(exc.detected_at)} • Estimated Duration:{' '}
                            <span className="font-bold text-slate-800">{exc.duration_minutes} mins</span>
                          </div>

                          {/* Clinic action taken */}
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                            <div>
                              <span className="font-bold text-slate-800">Clinic Action Taken: </span>
                              <span className="text-slate-700">{exc.action_taken}</span>
                            </div>
                            {exc.notes && (
                              <div>
                                <span className="font-bold text-slate-800">Field Notes: </span>
                                <span className="text-slate-600">{exc.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Stock at risk badge */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectedExcursion(exc)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Stock at Risk ({atRiskBatches.length} lots assigned)</span>
                            </button>
                            {exc.status === 'RESOLVED' && (
                              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Resolved by {exc.resolved_by} ({formatDateTime(exc.resolved_at)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Resolve Button */}
                        <div className="shrink-0 flex items-center gap-2">
                          {exc.status === 'OPEN' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setResolvingExcursion(exc);
                                setResolutionNotes('');
                              }}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              Mark as Resolved
                            </button>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POWER OUTAGES & EQUIPMENT FAULTS */}
        {activeTab === 'outages' && (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Power Outage & Equipment Fault Incidents
                </h3>
                <p className="text-xs text-slate-500">
                  Reported disruptions from border grid instabilities or diesel generator outages
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Clinic & Equipment</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Started At</th>
                    <th className="py-3 px-4">Resolved At</th>
                    <th className="py-3 px-4">Incident Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outages.map((out) => {
                    const clinic = clinics.find((c) => c.id === out.clinic_id);
                    const eq = equipment.find((e) => e.id === out.equipment_id);

                    return (
                      <tr key={out.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">{clinic?.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {eq ? `${eq.name} (${eq.equipment_code})` : 'Entire Facility Grid'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {out.type === 'POWER_OUTAGE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <ZapOff className="w-3 h-3" />
                              Power Outage
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                              <Wrench className="w-3 h-3" />
                              Equipment Fault
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatDateTime(out.started_at)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {out.ended_at ? formatDateTime(out.ended_at) : <span className="font-bold text-rose-600">Ongoing</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{out.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register / Edit Equipment Modal */}
      {isEqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingEq ? 'Edit Equipment Unit' : 'Register Cold Chain Equipment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEqModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor={eqClinicSelectId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Assigned Clinic
                </label>
                <select
                  id={eqClinicSelectId}
                  value={eqClinicId}
                  onChange={(e) => setEqClinicId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.clinic_code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={eqCodeInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Equipment Code
                  </label>
                  <input
                    id={eqCodeInputId}
                    type="text"
                    required
                    value={eqCode}
                    onChange={(e) => setEqCode(e.target.value)}
                    placeholder="ML-FR-01"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold uppercase text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={eqTypeSelectId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Unit Type
                  </label>
                  <select
                    id={eqTypeSelectId}
                    value={eqType}
                    onChange={(e) => setEqType(e.target.value as EquipmentType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value="FRIDGE">Refrigerator (2-8°C)</option>
                    <option value="FREEZER">Freezer (-20°C)</option>
                    <option value="COLD_BOX">Mobile Cold Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor={eqNameInputId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Equipment Descriptive Name
                </label>
                <input
                  id={eqNameInputId}
                  type="text"
                  required
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  placeholder="Main Vaccine Refrigerator"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={eqLocationInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Internal Location
                  </label>
                  <input
                    id={eqLocationInputId}
                    type="text"
                    value={eqLocation}
                    onChange={(e) => setEqLocation(e.target.value)}
                    placeholder="MCH Room 102"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={eqModelInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Model / PQS
                  </label>
                  <input
                    id={eqModelInputId}
                    type="text"
                    value={eqModel}
                    onChange={(e) => setEqModel(e.target.value)}
                    placeholder="Vestfrost VLS 024 SD"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={eqMinTempInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Min Temp Limit (°C)
                  </label>
                  <input
                    id={eqMinTempInputId}
                    type="number"
                    step="0.1"
                    required
                    value={eqMinTemp}
                    onChange={(e) => setEqMinTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={eqMaxTempInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Max Temp Limit (°C)
                  </label>
                  <input
                    id={eqMaxTempInputId}
                    type="number"
                    step="0.1"
                    required
                    value={eqMaxTemp}
                    onChange={(e) => setEqMaxTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={eqStatusSelectId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Status
                </label>
                <select
                  id={eqStatusSelectId}
                  value={eqStatus}
                  onChange={(e) => setEqStatus(e.target.value as EquipmentStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                >
                  <option value="ACTIVE">Active in Service</option>
                  <option value="RETIRED">Retired / Decommissioned</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEqModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEq}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingEq ? 'Saving...' : editingEq ? 'Update Unit' : 'Register Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock at Risk Modal */}
      {inspectedExcursion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-rose-950 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Cold Chain Batches at Risk</span>
                </h3>
                <p className="text-xs text-rose-800">
                  Unit: {equipment.find((e) => e.id === inspectedExcursion.equipment_id)?.name} (
                  {equipment.find((e) => e.id === inspectedExcursion.equipment_id)?.equipment_code})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedExcursion(null)}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-96 space-y-3">
              {getStockAtRisk(inspectedExcursion).length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No individual medicine batches were explicitly assigned to this refrigerator. Check clinic stock for all cold-chain items.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Batch #</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getStockAtRisk(inspectedExcursion).map((b) => {
                        const it = items.find((i) => i.id === b.item_id);
                        return (
                          <tr key={b.id}>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{it?.name}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                              {b.batch_number}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {formatDate(b.expiry_date)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {b.quantity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedExcursion(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Excursion Modal */}
      {resolvingExcursion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Resolve Excursion Event</span>
              </h3>
              <button
                type="button"
                onClick={() => setResolvingExcursion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveExcursion} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Confirm that the temperature issue has stabilized and that affected vaccine vial monitors (VVM) or cold chain stock have been verified safe or quarantined.
              </p>

              <div>
                <label
                  htmlFor={excursionNotesId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Resolution Notes & Audit Findings
                </label>
                <textarea
                  id={excursionNotesId}
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g., Inverter replaced; temp stabilized at 4.2°C; VVM stage 1 verified; stock retained..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingExcursion(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {resolving ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
