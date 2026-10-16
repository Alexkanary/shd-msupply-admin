import { useState, useId } from 'react';
import {
  Settings as SettingsIcon,
  KeyRound,
  Globe,
  Server,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Info,
  Check,
  Zap,
  Languages,
} from 'lucide-react';
import {
  getSelectedTimezone,
  setSelectedTimezone,
  getDeviceTimezone,
  AVAILABLE_TIMEZONES,
  formatLiveClock,
} from '../../services/time';
import {
  updateCredentials,
  isUsingDefaultCredentials,
  getCurrentUser,
} from '../../services/auth';
import { getApiBaseUrl, setApiBaseUrl, api } from '../../services/api';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../services/i18n';
import { LanguageSelector } from '../common/LanguageSelector';

interface SettingsViewProps {
  onDataReset: () => void;
}

export function SettingsView({ onDataReset }: SettingsViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const currentPasswordInputId = useId();
  const newUsernameInputId = useId();
  const newPasswordInputId = useId();
  const confirmPasswordInputId = useId();
  const timezoneSelectId = useId();
  const apiUrlInputId = useId();

  // 1. Credentials change state
  const currentUser = getCurrentUser();
  const isDefault = isUsingDefaultCredentials();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentUser?.username || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);

  // 2. Timezone state
  const [selectedTz, setSelectedTz] = useState<string>(getSelectedTimezone());
  const [tzPreview, setTzPreview] = useState<string>(formatLiveClock(new Date(), selectedTz));
  const [tzSuccess, setTzSuccess] = useState<boolean>(false);

  // 3. API URL state
  const [apiUrl, setApiUrl] = useState<string>(getApiBaseUrl());
  const [testingApi, setTestingApi] = useState<boolean>(false);
  const [apiStatusResult, setApiStatusResult] = useState<{
    ok: boolean;
    message: string;
    latency?: number;
  } | null>(null);
  const [apiUrlSaved, setApiUrlSaved] = useState<boolean>(false);

  // 4. Data reset state
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (newPassword !== confirmPassword) {
      setCredError('New password and confirmation do not match.');
      return;
    }

    const res = updateCredentials(currentPassword, newUsername, newPassword);
    if (res.success) {
      setCredSuccess('Admin credentials updated successfully! The default password no longer works.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setCredError(res.error || 'Failed to update credentials.');
    }
  };

  const handleTimezoneChange = (tz: string) => {
    setSelectedTz(tz);
    setSelectedTimezone(tz);
    setTzPreview(formatLiveClock(new Date(), tz));
    setTzSuccess(true);
    setTimeout(() => setTzSuccess(false), 2500);
  };

  const handleUseDeviceTimezone = () => {
    const devTz = getDeviceTimezone();
    handleTimezoneChange(devTz);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setApiUrlSaved(true);
    setTimeout(() => setApiUrlSaved(false), 2500);
  };

  const handleTestApiConnection = async () => {
    setTestingApi(true);
    setApiStatusResult(null);
    const result = await api.testConnection(apiUrl);
    setApiStatusResult(result);
    setTestingApi(false);
  };

  const handleResetData = async () => {
    if (
      confirm(
        'Are you sure you want to restore the initial sample dataset (Mae La Clinic, Wang Pha Clinic, batch expirations, and temperature logs)?'
      )
    ) {
      setResetting(true);
      await api.resetAllData();
      setResetSuccess(true);
      setResetting(false);
      onDataReset();
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-teal-600" />
          <span>{t('settingsTitle')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('settingsDesc')}
        </p>
      </div>

      {/* SECTION 0: 4-LANGUAGE SELECTION */}
      <div className="bg-white rounded-xl border border-teal-200/90 shadow-sm overflow-hidden ring-1 ring-teal-500/10">
        <div className="p-5 bg-gradient-to-r from-teal-50/80 to-white border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {t('languagePreferences')}
              </h3>
              <p className="text-xs text-slate-600">
                {t('chooseSystemLanguage')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
            4 Languages Available
          </span>
        </div>

        <div className="p-5 space-y-3">
          {/* 4 Interactive Language Cards */}
          <LanguageSelector variant="cards" />

          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Current Active Language:</span>
              <span className="font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag}{' '}
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName} (
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name})
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Instant Switch • Saved to Device</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ADMIN CREDENTIALS */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('adminCredentials')}</h3>
              <p className="text-xs text-slate-500">
                Shared admin access for clinic supervisors and pharmacists
              </p>
            </div>
          </div>

          {isDefault ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('defaultPasswordActive')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Custom Password Secured
            </span>
          )}
        </div>

        <div className="p-5">
          {isDefault && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Security Notice: </span>
                This system is currently running on the default initial credential (
                <span className="font-mono font-semibold">admin</span> /{' '}
                <span className="font-mono font-semibold">admin123</span>). Please update your
                username and password immediately.
              </div>
            </div>
          )}

          {credError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{credError}</span>
            </div>
          )}

          {credSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{credSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
              <label
                htmlFor={currentPasswordInputId}
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t('currentPassword')}
              </label>
              <input
                id={currentPasswordInputId}
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (admin123 if default)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={newUsernameInputId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  {t('newUsername')}
                </label>
                <input
                  id={newUsernameInputId}
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor={newPasswordInputId}
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                >
                  {t('newPassword')}
                </label>
                <input
                  id={newPasswordInputId}
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={confirmPasswordInputId}
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                {t('confirmPassword')}
              </label>
              <input
                id={confirmPasswordInputId}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {t('updateCredentials')}
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2: REAL TIME ZONE CONFIGURATION */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('displayTimezone')}</h3>
              <p className="text-xs text-slate-500">
                {t('allDatesFormattedIn')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseDeviceTimezone}
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 underline cursor-pointer"
          >
            Detect device zone ({getDeviceTimezone()})
          </button>
        </div>

        <div className="p-5 space-y-4 max-w-lg">
          <div>
            <label
              htmlFor={timezoneSelectId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Selected Time Zone
            </label>
            <select
              id={timezoneSelectId}
              value={selectedTz}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
            >
              {AVAILABLE_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Live Formatted Output Sample:
            </div>
            <div className="font-mono text-xs font-bold text-teal-800">{tzPreview}</div>
            <div className="text-[10px] text-slate-400">
              Device Default Zone: <span className="font-mono">{getDeviceTimezone()}</span>
            </div>
          </div>

          {tzSuccess && (
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Timezone updated across all dashboard views.</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: BACKEND REST API CONFIGURATION */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('restApiBackend')}</h3>
              <p className="text-xs text-slate-500">
                Connect to Node.js/Express + PostgreSQL backend via Cloudflare Tunnel
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-w-lg">
          <form onSubmit={handleSaveApiUrl} className="space-y-3">
            <div>
              <label
                htmlFor={apiUrlInputId}
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                API Endpoint Base URL (Leave empty for Local Mock Engine)
              </label>
              <input
                id={apiUrlInputId}
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://admin.shd-supply.org"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Reads from <span className="font-mono">window.__CONFIG__.API_BASE_URL</span> at container startup or this custom override.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {t('save')} Base URL
              </button>
              <button
                type="button"
                onClick={handleTestApiConnection}
                disabled={testingApi}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingApi ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </form>

          {apiUrlSaved && (
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>API Base URL saved to storage.</span>
            </div>
          )}

          {apiStatusResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                apiStatusResult.ok
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {apiStatusResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span>{apiStatusResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: DATA RESET */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('factoryReset')}</h3>
              <p className="text-xs text-slate-500">
                Restore default demo records (clinics, batches, requisitions, cold chain fridges)
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600">
            Clicking reset re-seeds the in-browser storage with standard clinic inventory, realistic cold chain excursions, and sample requisitions.
          </p>

          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {resetting ? 'Resetting Data...' : 'Reset to Sample Data'}
          </button>

          {resetSuccess && (
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sample data restored successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
