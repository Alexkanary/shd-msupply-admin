import { useState, useId } from 'react';
import {
  HeartPulse,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Info,
  Globe,
} from 'lucide-react';
import { login, isUsingDefaultCredentials } from '../../services/auth';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../services/i18n';
import { LanguageSelector } from '../common/LanguageSelector';

interface LoginViewProps {
  onSuccess: () => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const usernameId = useId();
  const passwordId = useId();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDefault = isUsingDefaultCredentials();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
      setLoading(false);
    }, 250);
  };

  const fillDefaults = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Subtle Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Bar with 4 Options */}
      <div className="mb-4 z-20 flex items-center gap-1.5 p-1 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-lg">
        {SUPPORTED_LANGUAGES.map((opt) => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.nativeName}</span>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* Brand Header */}
        <div className="p-8 pb-6 bg-gradient-to-b from-teal-50/70 to-white border-b border-slate-100 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 items-center justify-center text-white shadow-lg shadow-teal-600/20 mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {t('appName')}
          </h1>
          <p className="text-xs font-semibold text-teal-700 tracking-wide uppercase mt-1">
            {t('dashboardTitle')}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {t('subTagline')}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-6">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isDefault && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t('defaultPasswordActive')}</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Initial login uses <span className="font-mono font-bold bg-amber-100/70 px-1 py-0.5 rounded">admin</span> / <span className="font-mono font-bold bg-amber-100/70 px-1 py-0.5 rounded">admin123</span>.
              </p>
              <button
                type="button"
                onClick={fillDefaults}
                className="mt-1 text-teal-800 font-semibold hover:underline text-left text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3" />
                <span>Autofill default credentials</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor={usernameId}
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id={usernameId}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all font-medium"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {t('currentPassword')} / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id={passwordId}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? t('loading') : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Admin Access</span>
            </div>
            <div className="font-medium text-slate-500">
              {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle attribution required */}
      <div className="mt-6 text-xs text-slate-500 text-center font-medium">
        {t('madeBy')}
      </div>
    </div>
  );
}
