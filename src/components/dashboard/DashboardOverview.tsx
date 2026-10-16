import {
  Building2,
  Boxes,
  FileCheck2,
  ThermometerSnowflake,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  Layers,
  Thermometer,
} from 'lucide-react';
import { Clinic, Batch, Item, Requisition, Report, Equipment, Excursion } from '../../types';
import { getExpiryStatus, formatDate, formatDateTime } from '../../services/time';
import { NavTab } from '../layout/Sidebar';
import { useLanguage } from '../../services/i18n';

interface DashboardOverviewProps {
  clinics: Clinic[];
  batches: Batch[];
  items: Item[];
  requisitions: Requisition[];
  reports: Report[];
  equipment: Equipment[];
  excursions: Excursion[];
  onNavigate: (tab: NavTab) => void;
  onSelectRequisition?: (reqId: string) => void;
}

export function DashboardOverview({
  clinics,
  batches,
  items,
  requisitions,
  reports,
  equipment,
  excursions,
  onNavigate,
  onSelectRequisition,
}: DashboardOverviewProps) {
  const { t } = useLanguage();
  // Compute batch expiry counts and list soonest-expiring
  const enrichedBatches = batches.map((b) => {
    const item = items.find((i) => i.id === b.item_id);
    const clinic = clinics.find((c) => c.id === b.clinic_id);
    const expiry = getExpiryStatus(b.expiry_date);
    return {
      ...b,
      itemName: item?.name || 'Unknown item',
      itemCategory: item?.category || 'General',
      storageReq: item?.storage_requirement || 'AMBIENT',
      clinicName: clinic?.name || 'Unknown clinic',
      clinicCode: clinic?.clinic_code || '',
      ...expiry,
    };
  });

  // Sort by daysRemaining ascending (soonest expiring or expired first)
  const sortedBatches = [...enrichedBatches].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const soonestBatches = sortedBatches.slice(0, 6);

  const redCount = enrichedBatches.filter((b) => b.status === 'RED').length;
  const amberCount = enrichedBatches.filter((b) => b.status === 'AMBER').length;
  const greenCount = enrichedBatches.filter((b) => b.status === 'GREEN').length;

  // Cold Chain breakdown:
  // In Range / In Excursion / Overdue
  const activeExcursions = excursions.filter((e) => e.status === 'OPEN');
  const now = new Date().getTime();
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  const overdueEquipment = equipment.filter((eq) => {
    if (eq.status !== 'ACTIVE') return false;
    if (!eq.last_reading_time) return true;
    const lastTime = new Date(eq.last_reading_time).getTime();
    return now - lastTime > TWELVE_HOURS_MS;
  });

  const excursionEqIds = new Set(activeExcursions.map((e) => e.equipment_id));
  const inExcursionCount = equipment.filter((eq) => eq.status === 'ACTIVE' && excursionEqIds.has(eq.id)).length;
  const overdueCount = overdueEquipment.length;
  const inRangeCount = Math.max(0, equipment.filter((eq) => eq.status === 'ACTIVE').length - inExcursionCount - overdueCount);

  // Pending Requisitions
  const pendingReqs = requisitions.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/20">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {t('subTagline')}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('overviewTitle')}
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            {t('overviewDesc')}
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block pointer-events-none">
          <Boxes className="w-48 h-48" />
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Clinics */}
        <div
          onClick={() => onNavigate('clinics')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('activeClinics')}
            </span>
            <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{clinics.length}</span>
            <span className="text-xs text-emerald-600 font-medium">{t('borderRegional')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{reports.length} {t('stockReportsSubmitted')}</span>
          </div>
        </div>

        {/* Cold Chain Health */}
        <div
          onClick={() => onNavigate('coldchain')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('coldChainUnits')}
            </span>
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                activeExcursions.length > 0
                  ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                  : 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white'
              }`}
            >
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{equipment.length}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {inRangeCount} {t('safeUnits')}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            {inExcursionCount > 0 ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {inExcursionCount} {t('excursionUnits')}
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">0 {t('excursionUnits')}</span>
            )}
            <span className="text-slate-300">•</span>
            <span>{overdueCount} {t('overdueUnits')}</span>
          </div>
        </div>

        {/* Soonest Expiring Batches */}
        <div
          onClick={() => onNavigate('stock')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('batchExpiryStatus')}
            </span>
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{batches.length}</span>
            <span className="text-xs text-slate-500">{t('trackedLots')}</span>
          </div>
          <div className="mt-2 text-xs flex items-center gap-2 font-medium">
            <span className="text-rose-600 font-semibold">{redCount} {t('redUrgent')}</span>
            <span className="text-amber-600 font-semibold">{amberCount} {t('amberWarning')}</span>
            <span className="text-emerald-600">{greenCount} {t('greenHealthy')}</span>
          </div>
        </div>

        {/* Pending Requisitions */}
        <div
          onClick={() => onNavigate('requisitions')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('pendingRequisitions')}
            </span>
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingReqs.length}</span>
            <span className="text-xs text-amber-700 font-semibold">{t('awaitingApproval')}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{requisitions.filter((r) => r.status === 'APPROVED').length} {t('readyForCarDispatch')}</span>
          </div>
        </div>
      </div>

      {/* Active Excursion Warning Banner (if any) */}
      {activeExcursions.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-200 text-rose-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-rose-900">
                  {t('activeExcursionsTitle')} ({activeExcursions.length} {t('inExcursion')})
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                  Critical
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {activeExcursions[0].notes || 'Temperature breached safe storage limits.'} Affected clinic:{' '}
                <span className="font-semibold underline">
                  {clinics.find((c) => c.id === activeExcursions[0].clinic_id)?.name}
                </span>{' '}
                • Action: {activeExcursions[0].action_taken}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('coldchain')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{t('reviewExcursion')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Soonest-Expiring Batches Widget & Cold Chain Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soonest-Expiring Batches Widget (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {t('soonestExpiringTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('soonestExpiringSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('stock')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('viewAllBatches')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">{t('itemAndBatch')}</th>
                  <th className="py-2.5 px-4">{t('clinic')}</th>
                  <th className="py-2.5 px-4">{t('qtyOnHand')}</th>
                  <th className="py-2.5 px-4">{t('expiryDate')}</th>
                  <th className="py-2.5 px-4">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {soonestBatches.map((batch) => {
                  let pillStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (batch.status === 'RED') {
                    pillStyle = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                  } else if (batch.status === 'AMBER') {
                    pillStyle = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
                  }

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{batch.itemName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Lot: {batch.batch_number} • {batch.itemCategory}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{batch.clinicName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{batch.clinicCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          {batch.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatDate(batch.expiry_date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${pillStyle}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              batch.status === 'RED'
                                ? 'bg-rose-600 animate-ping'
                                : batch.status === 'AMBER'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{batch.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cold Chain Equipment Status Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <ThermometerSnowflake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Cold Chain Monitor</h3>
                <p className="text-xs text-slate-500">Safe range 2°C - 8°C (fridge)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('coldchain')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {/* Status breakdown bars */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  In Range (Safe)
                </span>
                <span className="font-bold text-emerald-700">{inRangeCount} units</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${equipment.length ? (inRangeCount / equipment.length) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  In Excursion
                </span>
                <span className="font-bold text-rose-700">{inExcursionCount} units</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{
                    width: `${equipment.length ? (inExcursionCount / equipment.length) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Missed / Overdue
                </span>
                <span className="font-bold text-amber-700">{overdueCount} units</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full"
                  style={{
                    width: `${equipment.length ? (overdueCount / equipment.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick list of latest active excursion equipment */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Active Excursions
              </div>
              {activeExcursions.length === 0 ? (
                <div className="p-3 bg-emerald-50/60 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All active cold chain units operating within WHO safe limits.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeExcursions.map((exc) => {
                    const eq = equipment.find((e) => e.id === exc.equipment_id);
                    const cl = clinics.find((c) => c.id === exc.clinic_id);
                    return (
                      <div
                        key={exc.id}
                        className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-900">{eq?.name || 'Fridge'}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                            {exc.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-rose-800 mt-1">
                          {cl?.name} • Last reading: {eq?.last_reading_temp ?? '—'}°C
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Pending Requisitions & Recent Clinic Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requisitions */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Pending Clinic Requisitions</h3>
                <p className="text-xs text-slate-500">
                  Review & approve quantities before pharmacy pulls stock
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('requisitions')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
            >
              View Requisitions
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {pendingReqs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                No pending requisitions at this moment.
              </div>
            ) : (
              pendingReqs.map((req) => {
                const clinic = clinics.find((c) => c.id === req.clinic_id);
                return (
                  <div
                    key={req.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900">
                          {req.requisition_number}
                        </span>
                        <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                          {clinic?.name || 'Clinic'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">
                        {req.note || 'No special requisition note provided.'}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Submitted: {formatDateTime(req.created_at)} • {req.lines.length} items requested
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('requisitions');
                        onSelectRequisition?.(req.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shrink-0 cursor-pointer transition-colors shadow-2xs"
                    >
                      Review & Approve
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Clinic Stock Reports Inbox */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Recent Clinic Stock Reports</h3>
                <p className="text-xs text-slate-500">
                  Periodic reports (weekly/monthly) received from tablets
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
            >
              Reports Inbox
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {reports.slice(0, 4).map((report) => {
              const clinic = clinics.find((c) => c.id === report.clinic_id);
              return (
                <div
                  key={report.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{clinic?.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {report.period_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Report lines: {report.lines.length} batches verified
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Received: {formatDateTime(report.received_at)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('reports')}
                    className="text-xs text-teal-600 font-semibold hover:text-teal-800 cursor-pointer"
                  >
                    Inspect &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
