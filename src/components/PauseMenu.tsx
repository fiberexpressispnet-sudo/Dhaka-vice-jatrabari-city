/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayIcon, SettingsIcon, RecenterIcon, CloseIcon } from './Icons';

interface PauseMenuProps {
  onResume: () => void;
  onRestartMission: () => void;
  onUnstuckPlayer: () => void;
  onOpenSettings: () => void;
  onQuitToTitle: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartMission,
  onUnstuckPlayer,
  onOpenSettings,
  onQuitToTitle,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-bengali font-bold text-xl text-amber-400">
            খেলা স্থগিত (পজ)
          </h2>
          <button
            type="button"
            onClick={onResume}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Resume */}
          <button
            type="button"
            onClick={onResume}
            className="touch-zone w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold font-bengali flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <PlayIcon size={18} />
            <span>খেলা চালিয়ে যান (Resume)</span>
          </button>

          {/* Restart Mission */}
          <button
            type="button"
            onClick={onRestartMission}
            className="touch-zone w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold font-bengali flex items-center justify-center gap-2 active:scale-95"
          >
            <span>মিশন পুনরায় শুরু করুন (Restart Mission)</span>
          </button>

          {/* Unstuck / Recovery Mechanism */}
          <button
            type="button"
            onClick={onUnstuckPlayer}
            className="touch-zone w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold font-bengali flex items-center justify-center gap-2 active:scale-95"
            title="প্লেয়ার বা বাইক আটকে গেলে নিরাপদ স্থানে রিকভার করুন"
          >
            <RecenterIcon size={18} />
            <span>আটকে গেলে উদ্ধার (Unstuck / Recovery)</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="touch-zone w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold font-bengali flex items-center justify-center gap-2 active:scale-95"
          >
            <SettingsIcon size={18} />
            <span>সেটিংস পরিবর্তন (Settings)</span>
          </button>

          {/* Quit to Title */}
          <button
            type="button"
            onClick={onQuitToTitle}
            className="touch-zone w-full py-3 px-4 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 font-bold font-bengali flex items-center justify-center gap-2 active:scale-95"
          >
            <span>প্রধান মেনু (Quit to Title)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
