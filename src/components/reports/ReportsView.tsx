import { useState, useId } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Calendar,
  Building2,
  FileSpreadsheet,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Download,
  Boxes,
} from 'lucide-react';
import { Report, Clinic, Item } from '../../types';
import { formatDateTime, formatDate } from '../../services/time';

interface ReportsViewProps {
  reports: Report[];
  clinics: Clinic[];
  items: Item[];
}

export function ReportsView({ reports, clinics, items }: ReportsViewProps) {
  const searchInputId = useId();
  const clinicFilterId = useId();
  const periodFilterId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState<string>('ALL');
  const [filterPeriod, setFilterPeriod] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter((r) => {
    const clinic = clinics.find((c) => c.id === r.clinic_id);
    const matchesSearch =
      (clinic?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (clinic?.clinic_code.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      r.period_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClinic = filterClinic === 'ALL' || r.clinic_id === filterClinic;
    const matchesPeriod = filterPeriod === 'ALL' || r.period_type === filterPeriod;

    return matchesSearch && matchesClinic && matchesPeriod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-teal-600" />
            <span>Clinic Reports Inbox</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic stock reports (weekly / monthly) submitted by clinic tablets following the Report & Requisition model
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Reports Received: <span className="font-bold text-slate-800">{reports.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">Search reports</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search by clinic name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label htmlFor={clinicFilterId} className="sr-only">Filter by Clinic</label>
            <select
              id={clinicFilterId}
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Clinics ({clinics.length})</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clinic_code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={periodFilterId} className="sr-only">Filter by Period</label>
            <select
              id={periodFilterId}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Periods (Weekly & Monthly)</option>
              <option value="WEEKLY">Weekly Reports Only</option>
              <option value="MONTHLY">Monthly Reports Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Clinic</th>
                <th className="py-3 px-4">Period Type</th>
                <th className="py-3 px-4">Reporting Period</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4">Date Received</th>
                <th className="py-3 px-4">Batches Reported</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No reports match the current filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const clinic = clinics.find((c) => c.id === report.clinic_id);
                  const totalUsed = report.lines.reduce((acc, l) => acc + l.quantity_used, 0);

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{clinic?.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {clinic?.clinic_code} • {clinic?.location}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            report.period_type === 'WEEKLY'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {report.period_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(report.period_start)} &rarr; {formatDate(report.period_end)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDateTime(report.submitted_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDateTime(report.received_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{report.lines.length} lots</div>
                        <div className="text-[10px] text-slate-400">
                          {totalUsed} units consumed
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Inspect Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  <span>
                    Stock Report: {clinics.find((c) => c.id === selectedReport.clinic_id)?.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Period: {selectedReport.period_type} ({formatDate(selectedReport.period_start)} to{' '}
                  {formatDate(selectedReport.period_end)}) • Submitted:{' '}
                  {formatDateTime(selectedReport.submitted_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3">Lot / Batch #</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3 text-right">Quantity on Hand</th>
                      <th className="py-2.5 px-3 text-right">Quantity Used (Period)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.lines.map((line) => {
                      const item = items.find((i) => i.id === line.item_id);
                      return (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900">{item?.name}</span>
                            <span className="text-[10px] text-slate-400 block">{item?.category}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {line.batch_number}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {formatDate(line.expiry_date)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                            {line.quantity_on_hand}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-800 text-sm">
                            {line.quantity_used}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Verified from clinic stocktake report sync.
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
