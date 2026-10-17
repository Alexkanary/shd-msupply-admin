import { useState, useEffect } from 'react';
import {
  Clock,
  Radio,
  Send,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Server,
  Globe,
} from 'lucide-react';
import { formatLiveClock, getSelectedTimezone } from '../../services/time';
import { getCurrentUser, isUsingDefaultCredentials, logout } from '../../services/auth';
import { getApiBaseUrl } from '../../services/api';
import { useLanguage } from '../../services/i18n';
import { LanguageSelector } from '../common/LanguageSelector';
import { ShanHealthLogo } from '../common/ShanHealthLogo';

interface TopBarProps {
  onOpenSimulate: () => void;
  onNavigateSettings: () => void;
  onLogout: () => void;
}

export function TopBar({ onOpenSimulate, onNavigateSettings, onLogout }: TopBarProps) {
  const { t } = useLanguage();
  const [clockString, setClockString] = useState<string>('');
  const [currentTimezone, setCurrentTimezone] = useState<string>(getSelectedTimezone());
  const currentUser = getCurrentUser();
  const usingDefault = isUsingDefaultCredentials();
  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    // Update live clock every second
    const updateTime = () => {
      const tz = getSelectedTimezone();
      setCurrentTimezone(tz);
      setClockString(formatLiveClock(new Date(), tz));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-40">
      {/* Brand & Live Clock */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-slate-200 shrink-0">
          <ShanHealthLogo size="sm" className="w-8 h-8 shrink-0" />
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 font-sans">
            SHDmSupply
          </span>
        </div>

        {/* Live Clock with Real Device/Configured Time Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-tight text-slate-800 truncate">
                {clockString || 'Loading clock...'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 text-teal-700">
                <Globe className="w-3 h-3" />
                <span>{t('timezone')}:</span>
                <button
                  type="button"
                  onClick={onNavigateSettings}
                  className="underline hover:text-teal-900 cursor-pointer"
                  title="Change display timezone in settings"
                >
                  {currentTimezone}
                </button>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400 hidden lg:inline">{t('allDatesFormattedIn')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Language Selector, Sync Simulator, Backend Status & User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        {/* 4-Language Switcher Dropdown - opens to the right */}
        <div className="flex items-center">
          <LanguageSelector variant="compact" align="left" />
        </div>

        {/* Backend / Mock Mode Indicator */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            apiUrl
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
          title={apiUrl ? `Connected to ${apiUrl}` : 'Operating in Standalone Mock Store mode'}
        >
          <Server className="w-3.5 h-3.5" />
          <span>{apiUrl ? t('restApiConnected') : t('localMockEngine')}</span>
        </div>

        {/* Default Credential Notice */}
        {usingDefault && (
          <button
            type="button"
            onClick={onNavigateSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            title="Default password admin123 is active! Click to change"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('defaultPasswordActive')}</span>
            <span className="sm:hidden">{t('changePasswordShort')}</span>
          </button>
        )}

        {/* Simulate Clinic Sync Button */}
        <button
          type="button"
          onClick={onOpenSimulate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow transition-all cursor-pointer"
          title="Simulate incoming weekly reports or temperature excursions from clinic tablets"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('simulateClinicSync')}</span>
          <span className="sm:hidden">Simulate</span>
        </button>

        {/* User Pill & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentUser?.username || 'admin'}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              onLogout();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title={t('signOut')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
