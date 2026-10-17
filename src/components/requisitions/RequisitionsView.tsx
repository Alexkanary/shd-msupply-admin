import { useState, useId } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Car,
  Printer,
  Edit3,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  Package,
} from 'lucide-react';
import { Requisition, Clinic, Item, RequisitionStatus } from '../../types';
import { formatDateTime, formatDate, getSelectedTimezone } from '../../services/time';
import { api } from '../../services/api';
import { ShanHealthLogo } from '../common/ShanHealthLogo';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  clinics: Clinic[];
  items: Item[];
  onRefresh: () => void;
  initialSelectedReqId?: string | null;
}

export function RequisitionsView({
  requisitions,
  clinics,
  items,
  onRefresh,
  initialSelectedReqId = null,
}: RequisitionsViewProps) {
  const searchInputId = useId();
  const clinicFilterId = useId();
  const statusFilterId = useId();
  const statusSelectId = useId();
  const resupplyNotesId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Review / Edit modal
  const [activeReq, setActiveReq] = useState<Requisition | null>(() => {
    if (initialSelectedReqId) {
      return requisitions.find((r) => r.id === initialSelectedReqId) || null;
    }
    return null;
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<RequisitionStatus>('PENDING');
  const [resupplyNote, setResupplyNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Print Modal
  const [printReq, setPrintReq] = useState<Requisition | null>(null);

  const filteredReqs = requisitions.filter((r) => {
    const clinic = clinics.find((c) => c.id === r.clinic_id);
    const matchesSearch =
      r.requisition_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clinic?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (r.note?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesClinic = filterClinic === 'ALL' || r.clinic_id === filterClinic;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;

    return matchesSearch && matchesClinic && matchesStatus;
  });

  const openReviewModal = (req: Requisition) => {
    setActiveReq(req);
    const initialApproved: Record<string, number> = {};
    req.lines.forEach((line) => {
      initialApproved[line.id] =
        line.approved_qty !== null ? line.approved_qty : line.requested_qty;
    });
    setApprovedQuantities(initialApproved);
    setSelectedStatus(req.status);
    setResupplyNote(req.note || '');
    setIsEditModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    setSaving(true);
    try {
      await api.updateRequisition(
        activeReq.id,
        approvedQuantities,
        selectedStatus,
        resupplyNote.trim()
      );
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to update requisition:', err);
    } finally {
      setSaving(false);
    }
  };

  const openPrintModal = (req: Requisition) => {
    setPrintReq(req);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print View Container (visible when printing) */}
      {printReq && (
        <div className="print-only print-container font-sans text-black">
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  SHD M Supply System • Pharmacy Pull Sheet
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Clinic Resupply Order & Verification Note (Report & Requisition Model)
                </p>
              </div>
              <div className="text-right text-xs font-mono">
                <div className="font-bold text-sm">{printReq.requisition_number}</div>
                <div>Status: {printReq.status}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-300 text-xs">
              <div>
                <div>
                  <span className="font-bold">Clinic: </span>
                  {clinics.find((c) => c.id === printReq.clinic_id)?.name} (
                  <span className="font-mono font-bold">
                    {clinics.find((c) => c.id === printReq.clinic_id)?.clinic_code}
                  </span>
                  )
                </div>
                <div>
                  <span className="font-bold">Location: </span>
                  {clinics.find((c) => c.id === printReq.clinic_id)?.location}
                </div>
                <div>
                  <span className="font-bold">Requested On: </span>
                  {formatDateTime(printReq.created_at)}
                </div>
              </div>
              <div className="text-right">
                <div>
                  <span className="font-bold">Print Date & Time: </span>
                  <span className="font-mono font-semibold">
                    {formatDateTime(new Date().toISOString(), { includeSeconds: true })}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Time Zone: </span>
                  <span className="font-mono">{getSelectedTimezone()}</span>
                </div>
                <div>
                  <span className="font-bold">Resupply Method: </span>
                  <span>Direct Car Dispatch (No shipping carrier)</span>
                </div>
              </div>
            </div>

            {printReq.note && (
              <div className="mt-3 p-2 bg-slate-100 border border-slate-300 rounded text-xs">
                <span className="font-bold">Resupply Note: </span>
                {printReq.note}
              </div>
            )}
          </div>

          <table className="w-full text-left text-xs mb-8">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Item Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Storage Requirement</th>
                <th className="py-2 px-3 text-right">Requested Qty</th>
                <th className="py-2 px-3 text-right">Approved Qty</th>
                <th className="py-2 px-3 text-center">Pulled / Verified (✓)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {printReq.lines.map((line, idx) => {
                const item = items.find((i) => i.id === line.item_id);
                return (
                  <tr key={line.id}>
                    <td className="py-2 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold">{item?.name || 'Item'}</td>
                    <td className="py-2 px-3 text-slate-700">{item?.category}</td>
                    <td className="py-2 px-3 font-mono">
                      {item?.storage_requirement === 'COLD_CHAIN' ? 'Cold Chain 2-8°C' : item?.storage_requirement === 'FROZEN' ? 'Frozen' : 'Ambient'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">{line.requested_qty}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {line.approved_qty !== null ? line.approved_qty : line.requested_qty}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="inline-block w-6 h-6 border border-slate-400 rounded-xs" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signature Verification Blocks */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-300 text-xs">
            <div>
              <div className="font-bold mb-8">Prepared & Released by (Central Pharmacy):</div>
              <div className="border-b border-slate-400 mb-1" />
              <div className="text-slate-500 text-[10px]">Pharmacist Signature & Date</div>
            </div>
            <div>
              <div className="font-bold mb-8">Transported & Received by (Clinic Driver / Medic):</div>
              <div className="border-b border-slate-400 mb-1" />
              <div className="text-slate-500 text-[10px]">Driver Name, Signature & Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-teal-600" />
              <span>Clinic Requisitions & Resupply</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review stock requests from clinics, adjust approved quantities, and dispatch by car
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="p-1 rounded bg-teal-50 text-teal-700 font-semibold flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              Resupply by Car
            </span>
            <span>(Status: Pending &rarr; Approved &rarr; Fulfilled)</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label htmlFor={searchInputId} className="sr-only">Search requisitions</label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id={searchInputId}
                type="text"
                placeholder="Search requisition #, clinic, notes..."
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
              <label htmlFor={statusFilterId} className="sr-only">Filter by Status</label>
              <select
                id={statusFilterId}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
              >
                <option value="ALL">All Requisition Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved (Ready for pharmacy pull)</option>
                <option value="FULFILLED">Fulfilled (Delivered by car)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Requisition #</th>
                  <th className="py-3 px-4">Clinic</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4">Items Requested</th>
                  <th className="py-3 px-4">Resupply Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReqs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No requisitions match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredReqs.map((req) => {
                    const clinic = clinics.find((c) => c.id === req.clinic_id);

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pending Review
                      </span>
                    );
                    if (req.status === 'APPROVED') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <Check className="w-3 h-3" />
                          Approved
                        </span>
                      );
                    } else if (req.status === 'FULFILLED') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Fulfilled
                        </span>
                      );
                    }

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {req.requisition_number}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{clinic?.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {clinic?.clinic_code}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {formatDateTime(req.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{req.lines.length} items</span>
                          <span className="text-[11px] text-slate-400 block">
                            (
                            {req.lines.reduce(
                              (sum, l) =>
                                sum + (l.approved_qty !== null ? l.approved_qty : l.requested_qty),
                              0
                            )}{' '}
                            total units)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-600 text-[11px] truncate" title={req.note}>
                            {req.note || '—'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">{statusBadge}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openPrintModal(req)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Print Pull Sheet for Pharmacy"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openReviewModal(req)}
                              className="px-2.5 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              Review & Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review & Edit Modal */}
      {isEditModalOpen && activeReq && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Review Requisition: {activeReq.requisition_number}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {clinics.find((c) => c.id === activeReq.clinic_id)?.name} • Submitted{' '}
                  {formatDateTime(activeReq.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Items Table for Approved Quantity Editing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Requested Items & Approved Quantities
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Storage</th>
                        <th className="py-2.5 px-3 text-right">Requested</th>
                        <th className="py-2.5 px-3 text-right">Approved Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeReq.lines.map((line) => {
                        const item = items.find((i) => i.id === line.item_id);
                        const curApproved =
                          approvedQuantities[line.id] !== undefined
                            ? approvedQuantities[line.id]
                            : line.requested_qty;

                        return (
                          <tr key={line.id}>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {item?.name}
                              <span className="block text-[10px] text-slate-400">
                                {item?.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                              {item?.storage_requirement}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                              {line.requested_qty}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                max="10000"
                                value={curApproved}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setApprovedQuantities((prev) => ({
                                    ...prev,
                                    [line.id]: val,
                                  }));
                                }}
                                className="w-24 px-2 py-1 text-right text-xs border border-teal-300 rounded font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 bg-teal-50/40"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={statusSelectId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Requisition Status
                  </label>
                  <select
                    id={statusSelectId}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as RequisitionStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                  >
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved (Pharmacy to pull stock)</option>
                    <option value="FULFILLED">Fulfilled (Delivered by car to clinic)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    Resupply is carried out by car. Mark "Fulfilled" once stock reaches the clinic.
                  </span>
                </div>
              </div>

              {/* Plain text Resupply note */}
              <div>
                <label
                  htmlFor={resupplyNotesId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Resupply & Delivery Note (e.g. "delivered by car on Tuesday by Nurse Somchai")
                </label>
                <textarea
                  id={resupplyNotesId}
                  rows={2}
                  value={resupplyNote}
                  onChange={(e) => setResupplyNote(e.target.value)}
                  placeholder="Enter logistics or handoff notes (e.g., delivered by clinic pickup truck on Tuesday afternoon)..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openPrintModal(activeReq)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Open Print View</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Requisition Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen Preview for Print Modal */}
      {printReq && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-sm text-slate-800">
                  Pharmacy Pull Sheet Preview ({printReq.requisition_number})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerPrint}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintReq(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white text-xs font-sans">
              <div className="border border-slate-200 p-6 rounded-lg bg-slate-50/40">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base uppercase text-slate-900">
                      SHD M Supply System • Pharmacy Pull Sheet
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Clinic Resupply & Dispatch Document
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-teal-800">{printReq.requisition_number}</span>
                    <div className="text-[10px] text-slate-500">Status: {printReq.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] mb-4">
                  <div>
                    <div>
                      <span className="font-bold">Clinic:</span>{' '}
                      {clinics.find((c) => c.id === printReq.clinic_id)?.name} (
                      {clinics.find((c) => c.id === printReq.clinic_id)?.clinic_code})
                    </div>
                    <div>
                      <span className="font-bold">Location:</span>{' '}
                      {clinics.find((c) => c.id === printReq.clinic_id)?.location}
                    </div>
                    <div>
                      <span className="font-bold">Submitted:</span>{' '}
                      {formatDateTime(printReq.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>
                      <span className="font-bold">Print Timestamp:</span>{' '}
                      <span className="font-mono text-teal-800">
                        {formatDateTime(new Date().toISOString(), { includeSeconds: true })}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold">Timezone:</span> {getSelectedTimezone()}
                    </div>
                    <div>
                      <span className="font-bold">Delivery:</span> Car transport (No courier)
                    </div>
                  </div>
                </div>

                {printReq.note && (
                  <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                    <span className="font-bold">Note: </span>
                    {printReq.note}
                  </div>
                )}

                <table className="w-full text-left text-xs border border-slate-200 rounded overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5">Item Name</th>
                      <th className="py-2 px-2.5">Storage</th>
                      <th className="py-2 px-2.5 text-right">Req.</th>
                      <th className="py-2 px-2.5 text-right font-bold text-teal-900">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printReq.lines.map((l, i) => {
                      const item = items.find((it) => it.id === l.item_id);
                      return (
                        <tr key={l.id}>
                          <td className="py-2 px-2.5 font-mono">{i + 1}</td>
                          <td className="py-2 px-2.5 font-bold text-slate-900">{item?.name}</td>
                          <td className="py-2 px-2.5 text-slate-600 font-mono text-[10px]">
                            {item?.storage_requirement}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono">{l.requested_qty}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-teal-800">
                            {l.approved_qty !== null ? l.approved_qty : l.requested_qty}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-8 pt-4 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
                  <div>
                    <div className="font-bold mb-6">Pharmacist Verification:</div>
                    <div className="border-b border-slate-300 mb-1" />
                    <div>Signature / Date</div>
                  </div>
                  <div>
                    <div className="font-bold mb-6">Car Driver / Medic Acceptance:</div>
                    <div className="border-b border-slate-300 mb-1" />
                    <div>Name / Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
