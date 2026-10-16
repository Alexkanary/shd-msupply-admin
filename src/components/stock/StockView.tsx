import { useState, useId } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Trash2,
  Edit,
  Snowflake,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { Batch, Clinic, Item, Equipment, ExpiryStatus, StorageRequirement } from '../../types';
import { getExpiryStatus, formatDate, formatDateTime } from '../../services/time';
import { api } from '../../services/api';

interface StockViewProps {
  batches: Batch[];
  clinics: Clinic[];
  items: Item[];
  equipment: Equipment[];
  onRefresh: () => void;
  selectedClinicId?: string | null;
}

export function StockView({
  batches,
  clinics,
  items,
  equipment,
  onRefresh,
  selectedClinicId: initialClinicId = null,
}: StockViewProps) {
  const searchInputId = useId();
  const clinicFilterId = useId();
  const expiryFilterId = useId();
  const storageFilterId = useId();
  const batchClinicSelectId = useId();
  const batchItemSelectId = useId();
  const batchNumberInputId = useId();
  const batchQtyInputId = useId();
  const batchExpiryInputId = useId();
  const batchEqSelectId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClinic, setFilterClinic] = useState<string>(initialClinicId || 'ALL');
  const [filterExpiry, setFilterExpiry] = useState<string>('ALL');
  const [filterStorage, setFilterStorage] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formClinicId, setFormClinicId] = useState(clinics[0]?.id || '');
  const [formItemId, setFormItemId] = useState(items[0]?.id || '');
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(100);
  const [formExpiryDate, setFormExpiryDate] = useState('2027-06-30');
  const [formEquipmentId, setFormEquipmentId] = useState<string>('');

  // Enrich batches with joined data and calculated expiry status
  const enrichedBatches = batches.map((batch) => {
    const item = items.find((i) => i.id === batch.item_id);
    const clinic = clinics.find((c) => c.id === batch.clinic_id);
    const eq = equipment.find((e) => e.id === batch.equipment_id);
    const expiry = getExpiryStatus(batch.expiry_date);

    return {
      ...batch,
      itemName: item?.name || 'Unknown Item',
      unit: item?.unit || 'Unit',
      category: item?.category || 'General',
      storageReq: item?.storage_requirement || ('AMBIENT' as StorageRequirement),
      clinicName: clinic?.name || 'Unknown Clinic',
      clinicCode: clinic?.clinic_code || '',
      equipmentName: eq ? `${eq.name} (${eq.equipment_code})` : null,
      ...expiry,
    };
  });

  // Apply filters
  const filteredBatches = enrichedBatches.filter((b) => {
    const matchesSearch =
      b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clinicName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClinic = filterClinic === 'ALL' || b.clinic_id === filterClinic;
    const matchesExpiry = filterExpiry === 'ALL' || b.status === filterExpiry;
    const matchesStorage = filterStorage === 'ALL' || b.storageReq === filterStorage;

    return matchesSearch && matchesClinic && matchesExpiry && matchesStorage;
  });

  // Sort batches: Red (urgent) first, then Amber, then Green
  filteredBatches.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const openAdd = () => {
    setEditingBatch(null);
    setFormClinicId(clinics[0]?.id || '');
    setFormItemId(items[0]?.id || '');
    setFormBatchNumber('');
    setFormQuantity(100);
    setFormExpiryDate('2027-06-30');
    setFormEquipmentId('');
    setIsModalOpen(true);
  };

  const openEdit = (b: Batch) => {
    setEditingBatch(b);
    setFormClinicId(b.clinic_id);
    setFormItemId(b.item_id);
    setFormBatchNumber(b.batch_number);
    setFormQuantity(b.quantity);
    setFormExpiryDate(b.expiry_date);
    setFormEquipmentId(b.equipment_id || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveBatch({
        id: editingBatch ? editingBatch.id : undefined,
        clinic_id: formClinicId,
        item_id: formItemId,
        batch_number: formBatchNumber.trim().toUpperCase(),
        quantity: Number(formQuantity),
        expiry_date: formExpiryDate,
        equipment_id: formEquipmentId || null,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save batch:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this batch record?')) {
      await api.deleteBatch(id);
      onRefresh();
    }
  };

  // Available equipment for chosen clinic in modal
  const modalClinicEquipment = equipment.filter(
    (e) => e.clinic_id === formClinicId && e.status === 'ACTIVE'
  );
  const selectedItemData = items.find((i) => i.id === formItemId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            <span>Stock by Lot / Batch</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every item tracked by individual lot number with independent expiry date and cold chain location
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">Search batch or item</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search batch #, item, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Clinic filter */}
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

          {/* Expiry filter */}
          <div>
            <label htmlFor={expiryFilterId} className="sr-only">Filter by Expiry Status</label>
            <select
              id={expiryFilterId}
              value={filterExpiry}
              onChange={(e) => setFilterExpiry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Expiry Windows</option>
              <option value="RED">Red: Expiring &lt;3 months or Expired</option>
              <option value="AMBER">Amber: Expiring in 3-6 months</option>
              <option value="GREEN">Green: Healthy (&gt;6 months)</option>
            </select>
          </div>

          {/* Storage requirement */}
          <div>
            <label htmlFor={storageFilterId} className="sr-only">Filter by Storage</label>
            <select
              id={storageFilterId}
              value={filterStorage}
              onChange={(e) => setFilterStorage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Storage Types</option>
              <option value="AMBIENT">Ambient Room Temp</option>
              <option value="COLD_CHAIN">Cold Chain (2°C - 8°C)</option>
              <option value="FROZEN">Frozen (-25°C to -15°C)</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-4 text-slate-600">
            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">
              Status Legend:
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Healthy (&gt;6m)
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Expiring &lt;6m
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              Urgent (&lt;3m / Expired)
            </span>
          </div>
          <div className="text-slate-500 text-xs">
            Showing <span className="font-bold text-slate-900">{filteredBatches.length}</span> batch records
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Lot / Batch #</th>
                <th className="py-3 px-4">Clinic Location</th>
                <th className="py-3 px-4">Storage & Equipment</th>
                <th className="py-3 px-4">Qty on Hand</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Expiry Window</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => {
                  let pillStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (b.status === 'RED') {
                    pillStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
                  } else if (b.status === 'AMBER') {
                    pillStyle = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
                  }

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{b.itemName}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.category} • Unit: {b.unit}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {b.batch_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.clinicName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{b.clinicCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {b.storageReq === 'COLD_CHAIN' ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px]">
                            <Snowflake className="w-3.5 h-3.5 text-teal-600" />
                            <span>{b.equipmentName || 'Cold Chain (2-8°C)'}</span>
                          </div>
                        ) : b.storageReq === 'FROZEN' ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px]">
                            <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                            <span>{b.equipmentName || 'Freezer (-20°C)'}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                            <Sun className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ambient</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {b.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {formatDate(b.expiry_date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${pillStyle}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.status === 'RED'
                                ? 'bg-rose-600 animate-ping'
                                : b.status === 'AMBER'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{b.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(b)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Batch"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBatch ? 'Edit Stock Batch' : 'Add Stock Batch by Lot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={batchClinicSelectId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Clinic
                  </label>
                  <select
                    id={batchClinicSelectId}
                    value={formClinicId}
                    onChange={(e) => {
                      setFormClinicId(e.target.value);
                      setFormEquipmentId('');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clinic_code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={batchItemSelectId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Item
                  </label>
                  <select
                    id={batchItemSelectId}
                    value={formItemId}
                    onChange={(e) => setFormItemId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.storage_requirement})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor={batchNumberInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Batch / Lot #
                  </label>
                  <input
                    id={batchNumberInputId}
                    type="text"
                    required
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    placeholder="OXY-26X12"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={batchQtyInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    id={batchQtyInputId}
                    type="number"
                    min="0"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={batchExpiryInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Expiry Date
                  </label>
                  <input
                    id={batchExpiryInputId}
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Cold Chain Equipment Assignment */}
              {selectedItemData?.storage_requirement !== 'AMBIENT' && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
                  <label
                    htmlFor={batchEqSelectId}
                    className="block text-xs font-semibold text-teal-900 flex items-center gap-1.5"
                  >
                    <Snowflake className="w-3.5 h-3.5 text-teal-700" />
                    <span>Assign to Cold Chain Equipment (for Excursion Tracking)</span>
                  </label>
                  <select
                    id={batchEqSelectId}
                    value={formEquipmentId}
                    onChange={(e) => setFormEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                  >
                    <option value="">Unassigned Cold Box / Ambient Transfer</option>
                    {modalClinicEquipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.equipment_code} - {eq.name} ({eq.type}: {eq.min_temp}°C to {eq.max_temp}°C)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-teal-800">
                    If this refrigerator experiences an excursion, this batch will be automatically flagged as "Stock at Risk".
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
