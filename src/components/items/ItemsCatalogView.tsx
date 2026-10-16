import { useState, useId } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  Snowflake,
  Sun,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
} from 'lucide-react';
import { Item, StorageRequirement } from '../../types';
import { api } from '../../services/api';

interface ItemsCatalogViewProps {
  items: Item[];
  onRefresh: () => void;
}

export function ItemsCatalogView({ items, onRefresh }: ItemsCatalogViewProps) {
  const searchInputId = useId();
  const categoryFilterId = useId();
  const storageFilterId = useId();
  const itemNameInputId = useId();
  const itemCategoryInputId = useId();
  const itemUnitInputId = useId();
  const itemReorderInputId = useId();
  const itemStorageSelectId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStorage, setFilterStorage] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState('Vial');
  const [formCategory, setFormCategory] = useState('Vaccines');
  const [formReorderLevel, setFormReorderLevel] = useState<number>(50);
  const [formStorage, setFormStorage] = useState<StorageRequirement>('AMBIENT');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.unit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || i.category === filterCategory;
    const matchesStorage = filterStorage === 'ALL' || i.storage_requirement === filterStorage;

    return matchesSearch && matchesCategory && matchesStorage;
  });

  const openAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormUnit('Vial');
    setFormCategory('Vaccines');
    setFormReorderLevel(50);
    setFormStorage('AMBIENT');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormCategory(item.category);
    setFormReorderLevel(item.reorder_level);
    setFormStorage(item.storage_requirement);
    setFormActive(item.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveItem({
        id: editingItem ? editingItem.id : undefined,
        name: formName.trim(),
        unit: formUnit.trim(),
        category: formCategory.trim(),
        reorder_level: Number(formReorderLevel),
        storage_requirement: formStorage,
        active: formActive,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-teal-600" />
            <span>Items & Medicine Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master list of medicines, vaccines, and consumable medical supplies with storage specifications
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">Search items</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search item name, category, unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label htmlFor={categoryFilterId} className="sr-only">Filter by Category</label>
            <select
              id={categoryFilterId}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Therapeutic Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={storageFilterId} className="sr-only">Filter by Storage Requirement</label>
            <select
              id={storageFilterId}
              value={filterStorage}
              onChange={(e) => setFilterStorage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">All Storage Conditions</option>
              <option value="AMBIENT">Ambient Room Temp</option>
              <option value="COLD_CHAIN">Cold Chain (2°C - 8°C)</option>
              <option value="FROZEN">Frozen (-20°C)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Dispensing Unit</th>
                <th className="py-3 px-4">Storage Requirement</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No catalog items found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{item.unit}</td>
                      <td className="py-3.5 px-4">
                        {item.storage_requirement === 'COLD_CHAIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            <Snowflake className="w-3.5 h-3.5 text-teal-600" />
                            Cold chain (2-8°C)
                          </span>
                        ) : item.storage_requirement === 'FROZEN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                            Frozen (-20°C)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            Ambient
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.reorder_level} units
                      </td>
                      <td className="py-3.5 px-4">
                        {item.active ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">Inactive</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-teal-50 to-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Edit Medicine / Item' : 'Add Item to Catalog'}
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
                  htmlFor={itemNameInputId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Medicine / Material Name
                </label>
                <input
                  id={itemNameInputId}
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Oxytocin 10 IU/ml Injection"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={itemCategoryInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Category
                  </label>
                  <input
                    id={itemCategoryInputId}
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Maternal Health"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={itemUnitInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Packaging Unit
                  </label>
                  <input
                    id={itemUnitInputId}
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Ampoule, Vial, Bottle"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={itemReorderInputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Reorder Minimum Level
                  </label>
                  <input
                    id={itemReorderInputId}
                    type="number"
                    min="0"
                    required
                    value={formReorderLevel}
                    onChange={(e) => setFormReorderLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor={itemStorageSelectId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Storage Requirement
                  </label>
                  <select
                    id={itemStorageSelectId}
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value as StorageRequirement)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value="AMBIENT">Ambient Room Temp</option>
                    <option value="COLD_CHAIN">Cold chain 2-8°C</option>
                    <option value="FROZEN">Frozen (-20°C)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="itemActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <label htmlFor="itemActive" className="text-xs font-medium text-slate-700">
                  Item active for clinical orders & stock reporting
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
                  {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
