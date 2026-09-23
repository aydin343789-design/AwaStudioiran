import React from 'react';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const Navbar: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/40 shadow-md shadow-emerald-500/10 flex items-center justify-center shrink-0">
            <img
              src="/app-logo.png"
              alt="لوگوی آوای ایران آزاد"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>آوای ایران آزاد</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gradient-to-r from-emerald-500/20 to-red-500/20 border border-emerald-500/30 text-emerald-300 font-normal">
                استودیو صوتی
              </span>
            </h1>
          </div>
        </div>

        {/* Right side status indicators */}
        <div className="flex items-center gap-2">
          {/* Online / Offline Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/50 border-amber-500/30 text-amber-300'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>آنلاین</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>آفلاین</span>
              </>
            )}
          </div>

          {/* Discreet PWA install button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
              title="نصب نسخه موبایل"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نصب</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
