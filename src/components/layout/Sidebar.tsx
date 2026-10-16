import {
  LayoutDashboard,
  Building2,
  Inbox,
  Boxes,
  FileCheck2,
  ThermometerSnowflake,
  PackageCheck,
  TrendingUp,
  Settings as SettingsIcon,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { useLanguage } from '../../services/i18n';

export type NavTab =
  | 'dashboard'
  | 'clinics'
  | 'reports'
  | 'stock'
  | 'requisitions'
  | 'coldchain'
  | 'items'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: {
    pendingReports: number;
    pendingRequisitions: number;
    activeExcursions: number;
    expiringBatches: number;
  };
}

export function Sidebar({ currentTab, onSelectTab, counts }: SidebarProps) {
  const { t } = useLanguage();

  const navItems: {
    id: NavTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'clinics',
      label: t('navClinics'),
      icon: Building2,
    },
    {
      id: 'reports',
      label: t('navReports'),
      icon: Inbox,
      badge: counts.pendingReports > 0 ? counts.pendingReports : undefined,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'stock',
      label: t('navStock'),
      icon: Boxes,
      badge: counts.expiringBatches > 0 ? counts.expiringBatches : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'requisitions',
      label: t('navRequisitions'),
      icon: FileCheck2,
      badge: counts.pendingRequisitions > 0 ? counts.pendingRequisitions : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'coldchain',
      label: t('navColdChain'),
      icon: ThermometerSnowflake,
      badge: counts.activeExcursions > 0 ? counts.activeExcursions : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
    },
    {
      id: 'items',
      label: t('navItems'),
      icon: PackageCheck,
    },
    {
      id: 'analytics',
      label: t('navAnalytics'),
      icon: TrendingUp,
    },
    {
      id: 'settings',
      label: t('navSettings'),
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-900/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-white">
              {t('appName')}
            </h1>
            <p className="text-xs text-teal-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              {t('dashboardTitle')}
            </p>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 bg-slate-800/60 rounded-md px-2.5 py-1 border border-slate-700/50">
          {t('subTagline')}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area with Required Attribution */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            System Healthy
          </span>
          <span className="text-[10px] text-slate-500 font-mono">v1.2.0</span>
        </div>
        {/* Subtle, small, muted credit as strictly required */}
        <div className="text-[11px] text-slate-500 pt-1 text-center font-normal tracking-wide">
          Made by Saidar (SHD)
        </div>
      </div>
    </aside>
  );
}
