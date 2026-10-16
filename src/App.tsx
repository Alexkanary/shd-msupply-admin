import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from './services/auth';
import { api } from './services/api';
import { getExpiryStatus } from './services/time';
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
} from './types';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { LoginView } from './components/auth/LoginView';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ClinicsView } from './components/clinics/ClinicsView';
import { ReportsView } from './components/reports/ReportsView';
import { StockView } from './components/stock/StockView';
import { RequisitionsView } from './components/requisitions/RequisitionsView';
import { ColdChainView } from './components/coldchain/ColdChainView';
import { ItemsCatalogView } from './components/items/ItemsCatalogView';
import { AnalyticsView } from './components/charts/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { SimulateSyncModal } from './components/modals/SimulateSyncModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [selectedClinicStockId, setSelectedClinicStockId] = useState<string | null>(null);
  const [targetReqId, setTargetReqId] = useState<string | null>(null);

  // Core application state
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLog[]>([]);
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [outages, setOutages] = useState<OutageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [
        clinicsData,
        itemsData,
        batchesData,
        eqData,
        reportsData,
        reqsData,
        tempLogsData,
        excData,
        outagesData,
      ] = await Promise.all([
        api.getClinics(),
        api.getItems(),
        api.getBatches(),
        api.getEquipment(),
        api.getReports(),
        api.getRequisitions(),
        api.getTemperatureLogs(),
        api.getExcursions(),
        api.getOutages(),
      ]);

      setClinics(clinicsData);
      setItems(itemsData);
      setBatches(batchesData);
      setEquipment(eqData);
      setReports(reportsData);
      setRequisitions(reqsData);
      setTemperatureLogs(tempLogsData);
      setExcursions(excData);
      setOutages(outagesData);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Handle clinic stock inspection link
  const handleSelectClinicStock = (clinicId: string) => {
    setSelectedClinicStockId(clinicId);
    setCurrentTab('stock');
  };

  // Badge counts for sidebar
  const pendingReportsCount = reports.length;
  const pendingRequisitionsCount = requisitions.filter((r) => r.status === 'PENDING').length;
  const activeExcursionsCount = excursions.filter((e) => e.status === 'OPEN').length;
  const expiringBatchesCount = batches.filter((b) => {
    const s = getExpiryStatus(b.expiry_date).status;
    return s === 'RED' || s === 'AMBER';
  }).length;

  if (!isAuthenticated) {
    return (
      <LoginView
        onSuccess={() => {
          setIsAuthenticated(true);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'stock') setSelectedClinicStockId(null);
          setCurrentTab(tab);
        }}
        counts={{
          pendingReports: pendingReportsCount,
          pendingRequisitions: pendingRequisitionsCount,
          activeExcursions: activeExcursionsCount,
          expiringBatches: expiringBatchesCount,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-clip">
        {/* TopBar with Live Clock and Actions */}
        <TopBar
          onOpenSimulate={() => setIsSimulateOpen(true)}
          onNavigateSettings={() => setCurrentTab('settings')}
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Loading clinic records & cold chain telemetry...
                </p>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardOverview
                  clinics={clinics}
                  batches={batches}
                  items={items}
                  requisitions={requisitions}
                  reports={reports}
                  equipment={equipment}
                  excursions={excursions}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onSelectRequisition={(reqId) => {
                    setTargetReqId(reqId);
                    setCurrentTab('requisitions');
                  }}
                />
              )}

              {currentTab === 'clinics' && (
                <ClinicsView
                  clinics={clinics}
                  equipment={equipment}
                  reports={reports}
                  batches={batches}
                  onRefresh={loadData}
                  onSelectClinicStock={handleSelectClinicStock}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  reports={reports}
                  clinics={clinics}
                  items={items}
                />
              )}

              {currentTab === 'stock' && (
                <StockView
                  batches={batches}
                  clinics={clinics}
                  items={items}
                  equipment={equipment}
                  onRefresh={loadData}
                  selectedClinicId={selectedClinicStockId}
                />
              )}

              {currentTab === 'requisitions' && (
                <RequisitionsView
                  requisitions={requisitions}
                  clinics={clinics}
                  items={items}
                  onRefresh={loadData}
                  initialSelectedReqId={targetReqId}
                />
              )}

              {currentTab === 'coldchain' && (
                <ColdChainView
                  equipment={equipment}
                  clinics={clinics}
                  temperatureLogs={temperatureLogs}
                  excursions={excursions}
                  outages={outages}
                  batches={batches}
                  items={items}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'items' && (
                <ItemsCatalogView
                  items={items}
                  onRefresh={loadData}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView
                  clinics={clinics}
                  items={items}
                  batches={batches}
                  reports={reports}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  onDataReset={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Simulator Modal for Testing Sync */}
      <SimulateSyncModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        clinics={clinics}
        equipment={equipment}
        items={items}
        onSynced={loadData}
      />
    </div>
  );
}
