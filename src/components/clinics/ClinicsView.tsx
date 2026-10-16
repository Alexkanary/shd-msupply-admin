import { useState, useId } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit2,
  ExternalLink,
  ThermometerSnowflake,
  Clock,
  Layers,
} from 'lucide-react';
import { Clinic, Equipment, Report, Batch } from '../../types';
import { formatDateTime } from '../../services/time';
import { api } from '../../services/api';

interface ClinicsViewProps {
  clinics: Clinic[];
  equipment: Equipment[];
  reports: Report[];
  batches: Batch[];
  onRefresh: () => void;
  onSelectClinicStock?: (clinicId: string) => void;
}

export function ClinicsView({
  clinics,
  equipment,
  reports,
  batches,
  onRefresh,
  onSelectClinicStock,
}: ClinicsViewProps) {
  const searchInputId = useId();
  const clinicCodeId = useId();
  const clinicNameId = useId();
  const clinicLocationId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formActive, setFormActive] = useState(true);

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clinic_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setEditingClinic(null);
    setFormCode(`CL-0${clinics.length + 1}`);
    setFormName('');
    setFormLocation('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormCode(clinic.clinic_code);
    setFormName(clinic.name);
    setFormLocation(clinic.location);
    setFormActive(clinic.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveClinic({
        id: editingClinic ? editingClinic.id : undefined,
        clinic_code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        location: formLocation.trim(),
        active: formActive,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save clinic:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>Clinics Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage participating health outposts, clinics, and last reported stock periods
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clinic</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <label htmlFor={searchInputId} className="sr-only">Search clinics</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={searchInputId}
            type="text"
            placeholder="Search by clinic name, code (e.g. ML-01), or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredClinics.length}</span> clinics
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Clinic Code & Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Last Stock Report Date</th>
                <th className="py-3 px-4">Cold Chain Units</th>
                <th className="py-3 px-4">Batches on Hand</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No clinics found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredClinics.map((clinic) => {
                  const clinicEq = equipment.filter((e) => e.clinic_id === clinic.id);
                  const clinicBatches = batches.filter((b) => b.clinic_id === clinic.id);
                  const clinicReports = reports.filter((r) => r.clinic_id === clinic.id);

                  return (
                    <tr key={clinic.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs">
                            {clinic.clinic_code}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{clinic.name}</div>
                            <div className="text-[11px] text-slate-400">ID: {clinic.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{clinic.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          <span>{formatDateTime(clinic.last_report_date)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {clinicReports.length} reports received
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          <ThermometerSnowflake className="w-3.5 h-3.5 text-teal-600" />
                          <span>{clinicEq.length} active units</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span>{clinicBatches.length} lots</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {clinic.active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectClinicStock && (
                            <button
                              type="button"
                              onClick={() => onSelectClinicStock(clinic.id)}
                              className="px-2 py-1 rounded-md text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="View Stock"
                            >
                              Stock
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(clinic)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Clinic"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* Add / Edit Clinic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClinic ? 'Edit Clinic Details' : 'Register New Clinic'}
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
              <div>
                <label
                  htmlFor={clinicCodeId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Clinic Code (e.g. ML-01)
                </label>
                <input
                  id={clinicCodeId}
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="ML-01"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold uppercase text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor={clinicNameId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Clinic Name
                </label>
                <input
                  id={clinicNameId}
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Mae La Clinic"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor={clinicLocationId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Location & Sector
                </label>
                <input
                  id={clinicLocationId}
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Zone C, Tha Song Yang, Tak"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <label htmlFor="activeCheck" className="text-xs font-medium text-slate-700">
                  Clinic Active (eligible for Report & Requisition sync)
                </label>
              </div>

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
                  {saving ? 'Saving...' : editingClinic ? 'Update Clinic' : 'Create Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
