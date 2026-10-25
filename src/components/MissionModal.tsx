/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TakaIcon, CheckIcon, CloseIcon, PlayIcon, MotorcycleIcon } from './Icons';
import { MissionData } from '../types/game';

interface MissionModalProps {
  type: 'briefing' | 'success' | 'failed';
  mission: MissionData;
  onAcceptMission: () => void;
  onRestartMission: () => void;
  onContinueFreeRoam: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  type,
  mission,
  onAcceptMission,
  onRestartMission,
  onContinueFreeRoam,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
        
        {/* Header Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
            {type === 'success' ? <CheckIcon size={28} /> : <MotorcycleIcon size={28} />}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-bengali font-bold text-2xl text-amber-300">
          {type === 'success'
            ? 'মিশন সফল! (Mission Accomplished)'
            : type === 'failed'
            ? 'মিশন ব্যর্থ! (Mission Failed)'
            : mission.nameBn}
        </h2>

        {/* Body Description & Dialogue */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left flex flex-col gap-2">
          {type === 'briefing' && (
            <>
              <div className="text-xs font-bold text-amber-400 font-bengali">
                বড় ভাই রহিম (Motijheel Contact):
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-bengali">
                &ldquo;শুন MJ, সিন্ডিকেটের গোপন ডেটা ড্রাইভটা মতিঝিল ৪ নং গোডাউনে রাখা আছে। প্রতিদ্বন্দ্বী গ্যাং টের পাওয়ার আগেই মোটরসাইকেল ছুটিয়ে ওটা তুলে নে। তারপর সোজা এলিভেটেড ফ্লাইওভার দিয়ে গুলশান সেফহাউসে পৌঁছে দে!&rdquo;
              </p>
            </>
          )}

          {type === 'success' && (
            <>
              <div className="text-xs font-bold text-emerald-400 font-bengali">
                সিন্ডিকেট হেডকোয়ার্টার (Gulshan HQ):
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-bengali">
                &ldquo;অসাধারণ কাজ MJ! প্রতিদ্বন্দ্বী গ্যাং পিছু নেওয়ার আগেই তুমি গুলশানে ড্রাইভ ড্রপ করেছো। তোমার অ্যাকাউন্টে টাকা পাঠিয়ে দেওয়া হলো আর মোটরসাইকেলের গোল্ডেন সিন্ডিকেট ট্রিম আনলক হয়েছে!&rdquo;
              </p>
            </>
          )}

          {type === 'failed' && (
            <p className="text-sm text-rose-300 leading-relaxed font-bengali">
              সময় শেষ হয়ে গেছে অথবা মিশন বিঘ্নিত হয়েছে। আবার চেষ্টা করুন!
            </p>
          )}
        </div>

        {/* Rewards section on success */}
        {type === 'success' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-bengali">নগদ ইনাম</span>
              <div className="flex items-center gap-1 font-game font-bold text-emerald-300 text-lg">
                <TakaIcon size={18} />
                <span>+৳ ৫০,০০০</span>
              </div>
            </div>

            <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase font-bengali">সিন্ডিকেট সম্মান</span>
              <span className="font-game font-bold text-amber-300 text-lg">+৩৫০ REP</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          {type === 'briefing' && (
            <button
              type="button"
              onClick={onAcceptMission}
              className="touch-zone w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold font-bengali flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
            >
              <PlayIcon size={18} />
              <span>মিশন গ্রহণ করুন (Start Mission)</span>
            </button>
          )}

          {type === 'success' && (
            <>
              <button
                type="button"
                onClick={onContinueFreeRoam}
                className="touch-zone w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold font-bengali flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                <CheckIcon size={18} />
                <span>ঢাকা শহরে মুক্ত ভ্রমণ চালিয়ে যান (Free Roam)</span>
              </button>
              <button
                type="button"
                onClick={onRestartMission}
                className="touch-zone w-full py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold font-bengali hover:bg-slate-700 active:scale-95"
              >
                <span>মিশন পুনরায় খেলুন (Replay Mission)</span>
              </button>
            </>
          )}

          {type === 'failed' && (
            <button
              type="button"
              onClick={onRestartMission}
              className="touch-zone w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold font-bengali flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              <PlayIcon size={18} />
              <span>আবার চেষ্টা করুন (Retry)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
