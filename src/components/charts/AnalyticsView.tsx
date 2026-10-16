import { useState, useMemo, useId } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Building2,
  Package,
  Layers,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Clinic, Item, Batch, Report } from '../../types';
import { formatDate } from '../../services/time';

interface AnalyticsViewProps {
  clinics: Clinic[];
  items: Item[];
  batches: Batch[];
  reports: Report[];
}

export function AnalyticsView({ clinics, items, batches, reports }: AnalyticsViewProps) {
  const clinicSelectId = useId();
  const itemSelectId = useId();
  const timeRangeSelectId = useId();

  const [selectedClinicId, setSelectedClinicId] = useState<string>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('90D');

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // 1. Cross-clinic Stock Comparison data for selected item
  const crossClinicData = useMemo(() => {
    return clinics.map((c) => {
      const clinicBatches = batches.filter(
        (b) => b.clinic_id === c.id && b.item_id === selectedItemId
      );
      const totalStock = clinicBatches.reduce((acc, b) => acc + b.quantity, 0);

      // Reorder level benchmark
      const reorderLevel = selectedItem?.reorder_level || 50;

      return {
        clinicCode: c.clinic_code,
        clinicName: c.name,
        stock: totalStock,
        reorderLevel,
      };
    });
  }, [clinics, batches, selectedItemId, selectedItem]);

  // 2. Consumption Trends over time from reports
  const consumptionTrends = useMemo(() => {
    // Collect report line consumption for selected item (or all items)
    const sortedReports = [...reports].sort(
      (a, b) => new Date(a.period_end).getTime() - new Date(b.period_end).getTime()
    );

    return sortedReports.map((r) => {
      const clinic = clinics.find((c) => c.id === r.clinic_id);
      const matchingLines = r.lines.filter((l) =>
        selectedItemId ? l.item_id === selectedItemId : true
      );
      const used = matchingLines.reduce((acc, l) => acc + l.quantity_used, 0);
      const onHand = matchingLines.reduce((acc, l) => acc + l.quantity_on_hand, 0);

      return {
        period: formatDate(r.period_end),
        clinic: clinic?.clinic_code || 'Clinic',
        consumed: used,
        stockOnHand: onHand,
      };
    });
  }, [reports, clinics, selectedItemId]);

  // Total metrics
  const totalStockForItem = batches
    .filter((b) => b.item_id === selectedItemId)
    .reduce((acc, b) => acc + b.quantity, 0);

  const totalUsedRecent = reports.reduce((acc, r) => {
    const line = r.lines.find((l) => l.item_id === selectedItemId);
    return acc + (line ? line.quantity_used : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <span>Consumption Trends & Cross-Clinic Analytics</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated analysis of reported stock levels, burn rate, and distribution equity across clinics
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor={clinicSelectId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Clinic Scope
            </label>
            <select
              id={clinicSelectId}
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
            >
              <option value="ALL">Cross-Clinic Comparison (All)</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clinic_code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={itemSelectId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Analyzed Medicine / Item
            </label>
            <select
              id={itemSelectId}
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={timeRangeSelectId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Reporting Window
            </label>
            <select
              id={timeRangeSelectId}
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
            >
              <option value="30D">Last 30 Days (4 Weekly Reports)</option>
              <option value="90D">Last Quarter (90 Days)</option>
              <option value="1Y">Full Year Historical</option>
            </select>
          </div>
        </div>

        {/* Selected Item Quick KPI Bar */}
        {selectedItem && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{selectedItem.name}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                {selectedItem.unit}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Storage: {selectedItem.storage_requirement}</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-400">Total System Stock: </span>
                <span className="font-bold font-mono text-teal-800 text-sm">{totalStockForItem}</span>
              </div>
              <div>
                <span className="text-slate-400">Recent Consumption: </span>
                <span className="font-bold font-mono text-slate-800 text-sm">{totalUsedRecent}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of 2 Core Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cross-Clinic Stock Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800">
              Cross-Clinic Stock Comparison: {selectedItem?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current stock on hand compared against minimum reorder benchmark (dashed)
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossClinicData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="clinicCode"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} units`,
                    name === 'stock' ? 'Current Stock' : 'Reorder Benchmark',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar
                  dataKey="stock"
                  name="Stock on Hand"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Consumption and Stock Trends over reporting cycles */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800">
              Reported Consumption Trend & Stock Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Quantities consumed (teal) vs remaining stock on hand (indigo) per report cycle
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrends} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="consumed"
                  name="Quantity Consumed"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="stockOnHand"
                  name="Stock Remaining"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
